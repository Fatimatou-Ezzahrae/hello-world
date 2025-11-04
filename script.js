// Phone Tracker Application
class PhoneTracker {
  constructor() {
    this.contacts = this.loadContacts();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderContacts();
    this.updateContactCount();
  }

  setupEventListeners() {
    // Form submission
    const form = document.getElementById('trackingForm');
    form.addEventListener('submit', (e) => this.handleAddContact(e));

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => this.handleSearch());

    // Filter functionality
    const filterCategory = document.getElementById('filterCategory');
    filterCategory.addEventListener('change', () => this.handleSearch());
  }

  handleAddContact(e) {
    e.preventDefault();

    const contactName = document.getElementById('contactName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const category = document.getElementById('category').value;
    const notes = document.getElementById('notes').value.trim();

    // Validate phone number
    if (!this.validatePhoneNumber(phoneNumber)) {
      this.showToast('Please enter a valid phone number', 'error');
      return;
    }

    // Create contact object
    const contact = {
      id: Date.now().toString(),
      name: contactName,
      phone: this.formatPhoneNumber(phoneNumber),
      category: category,
      notes: notes,
      addedDate: new Date().toISOString(),
      lastContacted: null,
      callCount: 0
    };

    // Add to contacts array
    this.contacts.unshift(contact);
    this.saveContacts();
    this.renderContacts();
    this.updateContactCount();

    // Reset form
    e.target.reset();
    this.showToast('Contact added successfully!', 'success');
  }

  validatePhoneNumber(phone) {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Check if it has at least 10 digits
    return cleaned.length >= 10;
  }

  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for US numbers
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    // Return original if doesn't match standard format
    return phone;
  }

  handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterCategory = document.getElementById('filterCategory').value;

    let filteredContacts = this.contacts;

    // Filter by search term
    if (searchTerm) {
      filteredContacts = filteredContacts.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.phone.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filteredContacts = filteredContacts.filter(contact => 
        contact.category === filterCategory
      );
    }

    this.renderContacts(filteredContacts);
  }

  renderContacts(contactsToRender = this.contacts) {
    const container = document.getElementById('shipmentsContainer');
    const emptyState = document.getElementById('emptyState');

    if (contactsToRender.length === 0) {
      container.innerHTML = '';
      emptyState.classList.add('visible');
      return;
    }

    emptyState.classList.remove('visible');
    container.innerHTML = contactsToRender.map(contact => this.createContactCard(contact)).join('');

    // Add event listeners to buttons
    contactsToRender.forEach(contact => {
      const callBtn = document.getElementById(`call-${contact.id}`);
      const deleteBtn = document.getElementById(`delete-${contact.id}`);

      if (callBtn) {
        callBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleCall(contact.id);
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleDelete(contact.id);
        });
      }
    });
  }

  createContactCard(contact) {
    const categoryClass = contact.category.toLowerCase();
    const addedDate = new Date(contact.addedDate).toLocaleDateString();
    const lastContactedText = contact.lastContacted 
      ? new Date(contact.lastContacted).toLocaleDateString()
      : 'Never';

    return `
      <div class="shipment-card">
        <div class="shipment-header">
          <div class="shipment-info">
            <div class="tracking-number">${contact.name}</div>
            <div class="contact-details">
              <div class="contact-phone">
                📞 <a href="tel:${contact.phone.replace(/\D/g, '')}">${contact.phone}</a>
              </div>
              <span class="contact-category ${categoryClass}">${contact.category}</span>
            </div>
            ${contact.notes ? `<div class="contact-notes">📝 ${contact.notes}</div>` : ''}
          </div>
          <div class="shipment-actions">
            <button id="call-${contact.id}" class="call-button">
              📞 Call
            </button>
            <button id="delete-${contact.id}" class="btn btn-danger">
              Delete
            </button>
          </div>
        </div>
        <div class="contact-meta">
          <div class="last-contacted">
            <span>Last contacted: ${lastContactedText}</span>
          </div>
          <div>
            <span>Calls: ${contact.callCount} | Added: ${addedDate}</span>
          </div>
        </div>
      </div>
    `;
  }

  handleCall(contactId) {
    const contact = this.contacts.find(c => c.id === contactId);
    if (!contact) return;

    // Update last contacted and call count
    contact.lastContacted = new Date().toISOString();
    contact.callCount++;

    this.saveContacts();
    this.renderContacts();

    // Initiate call (will open phone dialer on mobile)
    const phoneNumber = contact.phone.replace(/\D/g, '');
    window.location.href = `tel:${phoneNumber}`;

    this.showToast(`Calling ${contact.name}...`, 'success');
  }

  handleDelete(contactId) {
    const contact = this.contacts.find(c => c.id === contactId);
    if (!contact) return;

    if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
      this.contacts = this.contacts.filter(c => c.id !== contactId);
      this.saveContacts();
      this.renderContacts();
      this.updateContactCount();
      this.showToast('Contact deleted successfully', 'success');
    }
  }

  updateContactCount() {
    const countBadge = document.getElementById('shipmentCount');
    countBadge.textContent = this.contacts.length;
  }

  saveContacts() {
    localStorage.setItem('phoneTrackerContacts', JSON.stringify(this.contacts));
  }

  loadContacts() {
    const saved = localStorage.getItem('phoneTrackerContacts');
    return saved ? JSON.parse(saved) : [];
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PhoneTracker();
});
