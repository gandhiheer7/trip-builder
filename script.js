// Global variables to track trip state
let selectedDuration = 0 // in hours
let selectedActivities = []
let totalTime = 0
let totalCost = 0

// Variables for employee details
let employeeCount = 1
let employeeCategory = 'standard'
const categoryMultipliers = {
  standard: 1,    // Standard cost
  premium: 1.5    // Premium costs 50% more
}

// DOM elements
const durationBtns = document.querySelectorAll(".duration-btn")
const addActivityBtns = document.querySelectorAll(".add-activity-btn")
const selectedActivitiesContainer = document.getElementById("selectedActivities")
const totalTimeElement = document.getElementById("totalTime")
const totalCostElement = document.getElementById("totalCost")
const warningModal = document.getElementById("warningModal")
const closeModalBtn = document.getElementById("closeModal")
const summaryPanel = document.getElementById("summaryPanel")
const employeeCountInput = document.getElementById('employeeCount');
const employeeCategoryRadios = document.querySelectorAll('input[name="employeeCategory"]');

// DOM elements for cost breakdown
const costBreakdownSection = document.getElementById('costBreakdown');
const breakdownBaseEl = document.getElementById('breakdownBase');
const multiplierRowEl = document.getElementById('multiplierRow');
const breakdownMultiplierEl = document.getElementById('breakdownMultiplier');
const breakdownTotalEl = document.getElementById('breakdownTotal');


// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners()
  updateSummary()
})

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
  durationBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      durationBtns.forEach((b) => b.classList.remove("active"))
      this.classList.add("active")
      selectedDuration = Number.parseInt(this.dataset.duration)
      checkTimeLimit()
    })
  })

  addActivityBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const activityItem = this.closest(".activity-item")
      const activityData = {
        name: activityItem.dataset.name,
        duration: Number.parseFloat(activityItem.dataset.duration),
        cost: Number.parseInt(activityItem.dataset.cost),
      }
      addActivity(activityData)
    })
  })

  closeModalBtn.addEventListener("click", () => { hideWarningModal() })

  warningModal.addEventListener("click", (e) => {
    if (e.target === warningModal) {
      hideWarningModal()
    }
  })
  
  employeeCountInput.addEventListener('change', (e) => {
    employeeCount = parseInt(e.target.value) || 1;
    recalculateTotalCost();
  });

  employeeCategoryRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      employeeCategory = e.target.value;
      recalculateTotalCost();
    });
  });
}

/**
 * Add an activity to the selected activities list
 * @param {Object} activity - Activity object with name, duration, and cost
 */
function addActivity(activity) {
  if (selectedActivities.find((a) => a.name === activity.name)) {
    showNotification("Activity already added!")
    return
  }

  if (selectedDuration > 0 && totalTime + activity.duration > selectedDuration) {
    showWarningModal()
    return
  }

  selectedActivities.push(activity)

  totalTime += activity.duration;
  
  const costMultiplier = categoryMultipliers[employeeCategory];
  totalCost += activity.cost * employeeCount * costMultiplier;

  updateSummary()
  showNotification(`${activity.name} added to your trip!`)
}

/**
 * Remove an activity from the selected activities list
 * @param {string} activityName - Name of the activity to remove
 */
function removeActivity(activityName) {
  const activityIndex = selectedActivities.findIndex((a) => a.name === activityName)

  if (activityIndex !== -1) {
    const activity = selectedActivities[activityIndex]
    selectedActivities.splice(activityIndex, 1)

    totalTime -= activity.duration
    
    const costMultiplier = categoryMultipliers[employeeCategory];
    totalCost -= activity.cost * employeeCount * costMultiplier;

    updateSummary()
    showNotification(`${activity.name} removed from your trip!`)
  }
}

function recalculateTotalCost() {
  totalCost = 0;
  const costMultiplier = categoryMultipliers[employeeCategory];
  selectedActivities.forEach(activity => {
    totalCost += activity.cost * employeeCount * costMultiplier;
  });
  updateSummary();
}

/**
 * Update the summary panel with current activities and totals
 */
function updateSummary() {
  totalTimeElement.textContent = totalTime.toFixed(1)
  totalCostElement.textContent = totalCost.toLocaleString()

  selectedActivitiesContainer.innerHTML = ""

  if (selectedActivities.length === 0) {
    selectedActivitiesContainer.innerHTML = `<p class="empty-message">No activities selected yet. Choose from the categories above!</p>`
    costBreakdownSection.style.display = 'none'; // Hide breakdown
  } else {
    selectedActivities.forEach((activity) => {
      const activityElement = createActivityElement(activity)
      selectedActivitiesContainer.appendChild(activityElement)
    })
    
    costBreakdownSection.style.display = 'block'; // Show breakdown
    updateCostBreakdown();
  }
}

/**
 * Updates the cost breakdown display in the summary
 */
function updateCostBreakdown() {
    let baseCost = 0;
    selectedActivities.forEach(activity => {
        baseCost += activity.cost * employeeCount;
    });

    const multiplierCost = totalCost - baseCost;

    breakdownBaseEl.textContent = `₹${baseCost.toLocaleString()}`;
    breakdownTotalEl.textContent = `₹${totalCost.toLocaleString()}`;
    
    if (employeeCategory === 'premium') {
        multiplierRowEl.style.display = 'flex';
        breakdownMultiplierEl.textContent = `+ ₹${multiplierCost.toLocaleString()}`;
    } else {
        multiplierRowEl.style.display = 'none';
    }
}


function createActivityElement(activity) {
  const activityDiv = document.createElement("div")
  activityDiv.className = "selected-activity"
  
  const costMultiplier = categoryMultipliers[employeeCategory];
  const perPersonCost = (activity.cost * costMultiplier).toLocaleString();

  activityDiv.innerHTML = `
        <div class="activity-info">
            <strong>${activity.name}</strong>
            <span>${activity.duration} hours • ₹${perPersonCost} per person</span>
        </div>
        <button class="remove-btn" onclick="removeActivity('${activity.name}')" title="Remove activity">×</button>
    `
  return activityDiv
}

function checkTimeLimit() {
  if (selectedDuration > 0 && totalTime > selectedDuration) {
    showWarningModal()
  }
}

function showWarningModal() {
  warningModal.classList.add("show")
  document.body.style.overflow = "hidden"
}

function hideWarningModal() {
  warningModal.classList.remove("show")
  document.body.style.overflow = "auto"
}

function showNotification(message) {
  const notification = document.createElement("div")
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3b82f6;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `
  notification.textContent = message
  document.body.appendChild(notification)
  setTimeout(() => { notification.style.transform = "translateX(0)" }, 100)
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => { notification.remove() }, 300)
  }, 3000)
}

// Expose removeActivity function to global scope for onclick handlers
window.removeActivity = removeActivity;