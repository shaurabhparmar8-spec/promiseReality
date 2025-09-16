const { validationResult } = require('express-validator');
const Contact = require('../models/Contact');

// Helper function to use mock data when database is not available
const useMockData = (error) => {
  return error.name === 'MongooseServerSelectionError' || 
         error.code === 'ENOTFOUND' || 
         error.message.includes('connect');
};

// Mock contact messages for demo
const mockContacts = [];

// Create new contact message
const createContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const contactData = {
      ...req.body,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || ''
    };

    let contact;
    
    try {
      contact = new Contact(contactData);
      await contact.save();
    } catch (dbError) {
      if (useMockData(dbError)) {
        // For demo purposes, create mock contact
        contact = {
          _id: Date.now().toString(),
          ...contactData,
          status: 'new',
          priority: 'medium',
          isRead: false,
          responseCount: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockContacts.push(contact);
        console.log('Mock contact created (database not available)');
      } else {
        throw dbError;
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
      data: {
        contact: {
          _id: contact._id,
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          createdAt: contact.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message. Please try again.',
      error: error.message
    });
  }
};

// Get all contact messages (Admin only)
const getAllContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let contacts, total;
    
    try {
      // Build filter object
      const filter = { isActive: true };
      
      if (req.query.status) {
        filter.status = req.query.status;
      }
      
      if (req.query.priority) {
        filter.priority = req.query.priority;
      }
      
      if (req.query.isRead !== undefined) {
        filter.isRead = req.query.isRead === 'true';
      }
      
      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
          { message: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      // Build sort object
      let sort = { createdAt: -1 }; // Default sort by newest
      
      if (req.query.sortBy) {
        switch (req.query.sortBy) {
          case 'oldest':
            sort = { createdAt: 1 };
            break;
          case 'priority':
            sort = { priority: -1, createdAt: -1 };
            break;
          case 'status':
            sort = { status: 1, createdAt: -1 };
            break;
        }
      }

      contacts = await Contact.find(filter)
        .populate('assignedTo', 'name email')
        .populate('readBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      total = await Contact.countDocuments(filter);
      
    } catch (dbError) {
      if (useMockData(dbError)) {
        console.log('Using mock data for contacts');
        
        // Filter mock contacts
        let filteredContacts = mockContacts.filter(c => c.isActive);
        
        if (req.query.status) {
          filteredContacts = filteredContacts.filter(c => c.status === req.query.status);
        }
        
        if (req.query.priority) {
          filteredContacts = filteredContacts.filter(c => c.priority === req.query.priority);
        }
        
        if (req.query.isRead !== undefined) {
          const isRead = req.query.isRead === 'true';
          filteredContacts = filteredContacts.filter(c => c.isRead === isRead);
        }
        
        if (req.query.search) {
          const searchTerm = req.query.search.toLowerCase();
          filteredContacts = filteredContacts.filter(c => 
            c.name.toLowerCase().includes(searchTerm) ||
            c.email.toLowerCase().includes(searchTerm) ||
            c.message.toLowerCase().includes(searchTerm)
          );
        }

        // Sort mock contacts
        if (req.query.sortBy) {
          switch (req.query.sortBy) {
            case 'oldest':
              filteredContacts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
              break;
            case 'priority':
              const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
              filteredContacts.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
              break;
            case 'status':
              filteredContacts.sort((a, b) => a.status.localeCompare(b.status));
              break;
            default:
              filteredContacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          }
        }
        
        total = filteredContacts.length;
        contacts = filteredContacts.slice(skip, skip + limit);
      } else {
        throw dbError;
      }
    }

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: page,
          totalPages,
          totalContacts: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: error.message
    });
  }
};

// Get single contact message (Admin only)
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let contact;
    
    try {
      contact = await Contact.findById(id)
        .populate('assignedTo', 'name email')
        .populate('readBy', 'name email')
        .populate('notes.addedBy', 'name email');
    } catch (dbError) {
      if (useMockData(dbError)) {
        console.log('Using mock data for single contact');
        contact = mockContacts.find(c => c._id === id);
      } else {
        throw dbError;
      }
    }

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact',
      error: error.message
    });
  }
};

// Update contact status (Admin only)
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, note } = req.body;
    
    let contact;
    
    try {
      const updateData = {};
      
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;
      if (assignedTo) updateData.assignedTo = assignedTo;
      
      // Mark as read if not already read
      if (!updateData.isRead) {
        updateData.isRead = true;
        updateData.readAt = new Date();
        updateData.readBy = req.user.id;
      }

      contact = await Contact.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email');

      // Add note if provided
      if (note && contact) {
        contact.notes.push({
          note,
          addedBy: req.user.id,
          addedAt: new Date()
        });
        await contact.save();
      }
    } catch (dbError) {
      if (useMockData(dbError)) {
        // For demo purposes, update mock contact
        const contactIndex = mockContacts.findIndex(c => c._id === id);
        if (contactIndex !== -1) {
          contact = { 
            ...mockContacts[contactIndex], 
            status: status || mockContacts[contactIndex].status,
            priority: priority || mockContacts[contactIndex].priority,
            isRead: true,
            readAt: new Date(),
            updatedAt: new Date()
          };
          mockContacts[contactIndex] = contact;
          console.log('Mock contact updated (database not available)');
        }
      } else {
        throw dbError;
      }
    }

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact',
      error: error.message
    });
  }
};

// Delete contact message (Admin only)
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    let contact;
    
    try {
      contact = await Contact.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
    } catch (dbError) {
      if (useMockData(dbError)) {
        // For demo purposes, mark mock contact as inactive
        const contactIndex = mockContacts.findIndex(c => c._id === id);
        if (contactIndex !== -1) {
          contact = mockContacts[contactIndex];
          contact.isActive = false;
          console.log('Mock contact deleted (database not available)');
        }
      } else {
        throw dbError;
      }
    }

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact',
      error: error.message
    });
  }
};

// Get contact statistics (Admin only)
const getContactStats = async (req, res) => {
  try {
    let stats;
    
    try {
      const totalContacts = await Contact.countDocuments({ isActive: true });
      const newContacts = await Contact.countDocuments({ status: 'new', isActive: true });
      const inProgressContacts = await Contact.countDocuments({ status: 'in-progress', isActive: true });
      const resolvedContacts = await Contact.countDocuments({ status: 'resolved', isActive: true });
      const unreadContacts = await Contact.countDocuments({ isRead: false, isActive: true });
      const urgentContacts = await Contact.countDocuments({ priority: 'urgent', isActive: true });
      
      // Get recent contacts (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentContacts = await Contact.countDocuments({ 
        createdAt: { $gte: sevenDaysAgo }, 
        isActive: true 
      });

      stats = {
        total: totalContacts,
        new: newContacts,
        inProgress: inProgressContacts,
        resolved: resolvedContacts,
        unread: unreadContacts,
        urgent: urgentContacts,
        recent: recentContacts
      };
    } catch (dbError) {
      if (useMockData(dbError)) {
        console.log('Using mock data for contact stats');
        const activeContacts = mockContacts.filter(c => c.isActive);
        
        stats = {
          total: activeContacts.length,
          new: activeContacts.filter(c => c.status === 'new').length,
          inProgress: activeContacts.filter(c => c.status === 'in-progress').length,
          resolved: activeContacts.filter(c => c.status === 'resolved').length,
          unread: activeContacts.filter(c => !c.isRead).length,
          urgent: activeContacts.filter(c => c.priority === 'urgent').length,
          recent: activeContacts.filter(c => {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return new Date(c.createdAt) >= sevenDaysAgo;
          }).length
        };
      } else {
        throw dbError;
      }
    }

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact statistics',
      error: error.message
    });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats
};