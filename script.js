// Package Tracker Application
class PackageTracker {
  constructor() {
    this.shipments = this.loadShipments();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderShipments();
  }

  setupEventListeners() {
    const form = document.getElementById('trackingForm');
    form.addEventListener('submit', (e) => this.handleAddTracking(e));
  }

  handleAddTracking(e) {
    e.preventDefault();
    
    const trackingNumber = document.getElementById('trackingNumber').value.trim();
    const carrier = document.getElementById('carrier').value;

    if (!trackingNumber || !carrier) {
      this.showToast('Please fill in all fields', 'error');
      return;
    }

    // Check for duplicates
    if (this.shipments.some(s => s.trackingNumber === trackingNumber)) {
      this.showToast('This tracking number is already being tracked', 'error');
      return;
    }

    const shipment = this.createShipment(trackingNumber, carrier);
    this.shipments.unshift(shipment);
    this.saveShipments();
    this.renderShipments();
    
    // Reset form
    e.target.reset();
    
    this.showToast('Tracking added successfully!', 'success');
  }

  createShipment(trackingNumber, carrier) {
    const statuses = ['pending', 'in-transit', 'delivered'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: Date.now().toString(),
      trackingNumber,
      carrier,
      status,
      addedDate: new Date().toISOString(),
      estimatedDelivery: this.generateEstimatedDelivery(),
      timeline: this.generateTimeline(status)
    };
  }

  generateEstimatedDelivery() {
    const days = Math.floor(Math.random() * 5) + 1;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  generateTimeline(status) {
    const locations = [
      'Memphis, TN',
      'Louisville, KY',
      'Chicago, IL',
      'Los Angeles, CA',
      'New York, NY',
      'Dallas, TX',
      'Atlanta, GA',
      'Seattle, WA'
    ];

    const events = [
      { status: 'Order Placed', icon: '📝' },
      { status: 'Package Picked Up', icon: '📦' },
      { status: 'In Transit', icon: '🚚' },
      { status: 'Out for Delivery', icon: '🚛' },
      { status: 'Delivered', icon: '✅' }
    ];

    let timeline = [];
    let numEvents = 2;

    if (status === 'in-transit') {
      numEvents = 3;
    } else if (status === 'delivered') {
      numEvents = 5;
    }

    for (let i = 0; i < numEvents; i++) {
      const event = events[i];
      const hoursAgo = (numEvents - i) * 12;
      const date = new Date();
      date.setHours(date.getHours() - hoursAgo);

      timeline.push({
        status: event.status,
        location: locations[Math.floor(Math.random() * locations.length)],
        date: date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        icon: event.icon
      });
    }

    return timeline;
  }

  renderShipments() {
    const container = document.getElementById('shipmentsContainer');
    const emptyState = document.getElementById('emptyState');
    const countBadge = document.getElementById('shipmentCount');

    countBadge.textContent = this.shipments.length;

    if (this.shipments.length === 0) {
      container.innerHTML = '';
      emptyState.classList.add('visible');
      return;
    }

    emptyState.classList.remove('visible');
    container.innerHTML = this.shipments.map(shipment => this.createShipmentCard(shipment)).join('');

    // Add event listeners to cards
    this.shipments.forEach(shipment => {
      const card = document.getElementById(`shipment-${shipment.id}`);
      const deleteBtn = card.querySelector('.btn-danger');
      const cardClickable = card.querySelector('.shipment-clickable');

      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteShipment(shipment.id);
      });

      cardClickable.addEventListener('click', () => {
        this.toggleTimeline(shipment.id);
      });
    });
  }

  createShipmentCard(shipment) {
    const statusConfig = {
      'pending': { label: 'Pending', icon: '⏳', class: 'pending' },
      'in-transit': { label: 'In Transit', icon: '🚚', class: 'in-transit' },
      'delivered': { label: 'Delivered', icon: '✅', class: 'delivered' },
      'exception': { label: 'Exception', icon: '⚠️', class: 'exception' }
    };

    const config = statusConfig[shipment.status] || statusConfig['pending'];

    return `
      <div class="shipment-card" id="shipment-${shipment.id}">
        <div class="shipment-clickable">
          <div class="shipment-header">
            <div class="shipment-info">
              <div class="tracking-number">${shipment.trackingNumber}</div>
              <div class="carrier-name">${shipment.carrier}</div>
            </div>
            <div class="shipment-actions">
              <button class="btn btn-danger" title="Delete tracking">🗑️</button>
            </div>
          </div>

          <div class="shipment-status">
            <span class="status-badge ${config.class}">
              <span class="status-icon">${config.icon}</span>
              ${config.label}
            </span>
            ${shipment.status !== 'delivered' ? 
              `<span class="estimated-delivery">Est. ${shipment.estimatedDelivery}</span>` : 
              `<span class="estimated-delivery">Delivered</span>`
            }
          </div>
        </div>

        <div class="timeline" id="timeline-${shipment.id}">
          <h3 style="font-size: 1rem; margin-bottom: 16px; color: var(--text-secondary);">Tracking History</h3>
          ${shipment.timeline.map((event, index) => `
            <div class="timeline-item">
              <div class="timeline-dot">${event.icon}</div>
              <div class="timeline-content">
                <div class="timeline-status">${event.status}</div>
                <div class="timeline-location">${event.location}</div>
                <div class="timeline-date">${event.date}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  toggleTimeline(shipmentId) {
    const timeline = document.getElementById(`timeline-${shipmentId}`);
    timeline.classList.toggle('expanded');
  }

  deleteShipment(shipmentId) {
    if (confirm('Are you sure you want to stop tracking this shipment?')) {
      this.shipments = this.shipments.filter(s => s.id !== shipmentId);
      this.saveShipments();
      this.renderShipments();
      this.showToast('Tracking removed', 'success');
    }
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  saveShipments() {
    localStorage.setItem('packageTrackerShipments', JSON.stringify(this.shipments));
  }

  loadShipments() {
    const saved = localStorage.getItem('packageTrackerShipments');
    return saved ? JSON.parse(saved) : [];
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PackageTracker();
});
