console.log("SCRIPT LOADED");

const API = "/api";

document.addEventListener("DOMContentLoaded", () => {

    // ===== LOGIN PAGE =====
    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const msg = document.getElementById("msg");

            if (!username || !password) {
                msg.textContent = "Please fill in all fields";
                return;
            }

            try {
                const res = await fetch(`${API}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem("token", data.accessToken);
                    localStorage.setItem("refreshToken", data.refreshToken);
                    window.location.href = "/profile.html";
                } else {
                    msg.textContent = data.message || "Login failed";
                }
            } catch (err) {
                msg.textContent = "Error connecting to server";
            }
        });
    }

    // ===== LOGOUT =====
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "/index.html";
        });
    }

    // ===== PROFILE PAGE =====
    if (window.location.pathname.includes("profile")) {
        const token = localStorage.getItem("token");
        if (!token) return location.href = "/index.html";

        const user = parseJwt(token);
        const userInfo = document.getElementById("userInfo");
        if (userInfo) {
            userInfo.textContent = `${user.username} (${user.role})`;
        }

        const adminBtn = document.getElementById("adminBtn");
        if (adminBtn) {
            adminBtn.addEventListener("click", () => {
                if (user.role === "admin") {
                    window.location.href = "/admin.html";
                } else {
                    alert("No access");
                }
            });
        }
    }

    // ===== ADMIN PAGE =====
    if (window.location.pathname.includes("admin")) {
        loadUsers();

        const createUserBtn = document.getElementById("createUserBtn");
        if (createUserBtn) {
            createUserBtn.addEventListener("click", async () => {
                const username = document.getElementById("newUsername").value;
                const password = document.getElementById("newPassword").value;
                const role = document.getElementById("newRole").value;
                const adminMsg = document.getElementById("adminMsg");

                if (!username || !password) {
                    adminMsg.textContent = "Please fill in all fields";
                    return;
                }

                try {
                    const res = await fetch(`${API}/admin/users`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + localStorage.getItem("token")
                        },
                        body: JSON.stringify({ username, password, role })
                    });

                    const data = await res.json();

                    if (res.ok) {
                        adminMsg.textContent = "User created successfully!";
                        adminMsg.style.color = "green";
                        document.getElementById("newUsername").value = "";
                        document.getElementById("newPassword").value = "";
                        document.getElementById("newRole").value = "worker";
                        loadUsers();
                    } else {
                        adminMsg.style.color = "red";
                        adminMsg.textContent = data.message || "Failed to create user";
                    }
                } catch (err) {
                    adminMsg.style.color = "red";
                    adminMsg.textContent = "Error: " + err.message + " - Make sure server is running";
                    console.error("Error details:", err);
                }
            });
        }
    }

    // ===== BOOKINGS PAGE =====
    if (window.location.pathname.includes("bookings")) {
        let allBookings = [];
        let currentDate = new Date();
        let editingBookingId = null;
        let selectedExtras = [];

        loadBookings();

        // View toggle
        document.getElementById("calendarViewBtn").addEventListener("click", () => {
            document.getElementById("calendarView").style.display = "block";
            document.getElementById("listView").style.display = "none";
            document.getElementById("calendarViewBtn").classList.add("active");
            document.getElementById("listViewBtn").classList.remove("active");
        });

        document.getElementById("listViewBtn").addEventListener("click", () => {
            document.getElementById("calendarView").style.display = "none";
            document.getElementById("listView").style.display = "block";
            document.getElementById("listViewBtn").classList.add("active");
            document.getElementById("calendarViewBtn").classList.remove("active");
        });

        // New booking button
        document.getElementById("newBookingBtn").addEventListener("click", () => {
            editingBookingId = null;
            selectedExtras = [];
            document.getElementById("modalTitle").textContent = "Create New Booking";
            document.getElementById("submitBookingBtn").textContent = "Create Booking";
            document.getElementById("bookingForm").reset();
            document.getElementById("extrasList").innerHTML = "";
            document.getElementById("bookingModal").classList.add("active");
        });

        // Cancel modal buttons
        document.getElementById("cancelModal").addEventListener("click", () => {
            document.getElementById("bookingModal").classList.remove("active");
        });
        document.getElementById("cancelModalBtn").addEventListener("click", () => {
            document.getElementById("bookingModal").classList.remove("active");
        });

        // Extras functionality
        document.getElementById("addExtraBtn").addEventListener("click", () => {
            const select = document.getElementById("extraSelect");
            const extra = select.value;
            if (extra && !selectedExtras.includes(extra)) {
                selectedExtras.push(extra);
                renderExtras();
                select.value = "";
            }
        });

        document.getElementById("addNewExtraBtn").addEventListener("click", () => {
            const input = document.getElementById("newExtra");
            const extra = input.value.trim();
            if (extra && !selectedExtras.includes(extra)) {
                selectedExtras.push(extra);
                renderExtras();
                input.value = "";
            }
        });

        function renderExtras() {
            const list = document.getElementById("extrasList");
            list.innerHTML = selectedExtras.map((extra, index) => 
                `<span class="extra-tag">${extra}<button type="button" onclick="removeExtra(${index})">×</button></span>`
            ).join("");
        }

        window.removeExtra = function(index) {
            selectedExtras.splice(index, 1);
            renderExtras();
        };

        // Calendar navigation
        document.getElementById("prevMonth").addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        document.getElementById("nextMonth").addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        document.getElementById("todayBtn").addEventListener("click", () => {
            currentDate = new Date();
            renderCalendar();
        });

        // Search and filter
        document.getElementById("searchInput").addEventListener("input", renderList);
        document.getElementById("statusFilter").addEventListener("change", renderList);

        // Form submit
        document.getElementById("bookingForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const firstName = document.getElementById("firstName").value.trim();
            const lastName = document.getElementById("lastName").value.trim();
            
            const bookingData = {
                customer: `${firstName} ${lastName}`,
                email: document.getElementById("customerEmail").value,
                phone: document.getElementById("customerPhone").value,
                item: document.getElementById("bookingItem").value,
                startDate: document.getElementById("startDate").value,
                endDate: document.getElementById("endDate").value,
                guests: parseInt(document.getElementById("guests").value),
                status: document.getElementById("bookingStatus").value,
                description: document.getElementById("description")?.value || "",
                extras: selectedExtras
            };

            try {
                const url = editingBookingId 
                    ? `${API}/bookings/${editingBookingId}`
                    : `${API}/bookings`;
                
                const method = editingBookingId ? "PATCH" : "POST";

                const res = await fetch(url, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + localStorage.getItem("token")
                    },
                    body: JSON.stringify(bookingData)
                });

                if (res.ok) {
                    document.getElementById("bookingModal").classList.remove("active");
                    loadBookings();
                } else {
                    alert("Failed to save booking");
                }
            } catch (err) {
                alert("Error: " + err.message);
            }
        });

        async function loadBookings() {
            try {
                const res = await fetch(`${API}/bookings`, {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token")
                    }
                });

                if (res.ok) {
                    allBookings = await res.json();
                    updateStats();
                    renderCalendar();
                    renderList();
                }
            } catch (err) {
                console.error("Error loading bookings:", err);
            }
        }

        function updateStats() {
            const now = new Date();
            const confirmed = allBookings.filter(b => b.status === "confirmed");
            const pending = allBookings.filter(b => b.status === "pending");
            const cancelled = allBookings.filter(b => b.status === "cancelled");
            const upcoming = allBookings.filter(b => 
                new Date(b.startDate) > now && b.status === "confirmed"
            );

            document.getElementById("confirmedCount").textContent = confirmed.length;
            document.getElementById("pendingCount").textContent = pending.length;
            document.getElementById("cancelledCount").textContent = cancelled.length;
            document.getElementById("upcomingCount").textContent = upcoming.length;
            
            const total = allBookings.length;
            const rate = total > 0 ? Math.round((confirmed.length / total) * 100) : 0;
            document.getElementById("confirmationRate").textContent = rate + "%";
            document.getElementById("totalRevenue").textContent = "€0.00";
        }

        function renderCalendar() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            
            document.getElementById("calendarMonth").textContent = `${monthNames[month]} ${year}`;

            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const startDay = firstDay.getDay();
            const daysInMonth = lastDay.getDate();

            let html = `
                <div class="calendar-day-header">Sun</div>
                <div class="calendar-day-header">Mon</div>
                <div class="calendar-day-header">Tue</div>
                <div class="calendar-day-header">Wed</div>
                <div class="calendar-day-header">Thu</div>
                <div class="calendar-day-header">Fri</div>
                <div class="calendar-day-header">Sat</div>
            `;

            // Previous month days
            const prevMonthDays = new Date(year, month, 0).getDate();
            for (let i = startDay - 1; i >= 0; i--) {
                html += `<div class="calendar-day other-month">
                    <div class="calendar-day-number">${prevMonthDays - i}</div>
                </div>`;
            }

            // Current month days
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayBookings = allBookings.filter(b => {
                    const start = new Date(b.startDate);
                    const end = new Date(b.endDate);
                    const current = new Date(dateStr);
                    return current >= start && current <= end;
                });

                html += `<div class="calendar-day">
                    <div class="calendar-day-number">${day}</div>`;
                
                dayBookings.forEach(booking => {
                    html += `<div class="booking-event ${booking.status}" 
                        onclick="viewBooking('${booking.id}')" 
                        title="${booking.customer} - ${booking.item} (${booking.status})">${booking.customer}</div>`;
                });

                html += `</div>`;
            }

            // Next month days
            const remainingDays = 42 - (startDay + daysInMonth);
            for (let i = 1; i <= remainingDays; i++) {
                html += `<div class="calendar-day other-month">
                    <div class="calendar-day-number">${i}</div>
                </div>`;
            }

            document.getElementById("calendarGrid").innerHTML = html;
        }

        function renderList() {
            const search = document.getElementById("searchInput").value.toLowerCase();
            const statusFilter = document.getElementById("statusFilter").value;

            let filtered = allBookings.filter(b => {
                const matchesSearch = b.customer.toLowerCase().includes(search) ||
                    b.email.toLowerCase().includes(search) ||
                    b.item.toLowerCase().includes(search);
                
                const matchesStatus = statusFilter === "all" || b.status === statusFilter;

                return matchesSearch && matchesStatus;
            });

            let html = "";
            filtered.forEach(booking => {
                html += `<tr>
                    <td>
                        <div style="font-weight: 500;">${booking.customer}</div>
                        <div style="font-size: 12px; color: #666;">${booking.email}</div>
                    </td>
                    <td>${booking.item}</td>
                    <td>${new Date(booking.startDate).toLocaleDateString()}</td>
                    <td>${new Date(booking.endDate).toLocaleDateString()}</td>
                    <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
                    <td>${booking.guests}</td>
                    <td>
                        <button onclick="editBooking('${booking.id}')" style="margin-right: 5px; background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">Edit</button>
                        <button onclick="deleteBooking('${booking.id}')" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">Delete</button>
                    </td>
                </tr>`;
            });

            document.getElementById("bookingTableBody").innerHTML = html || 
                '<tr><td colspan="7" style="text-align: center; padding: 20px;">No bookings found</td></tr>';
        }

        window.viewBooking = function(id) {
            const booking = allBookings.find(b => b.id === id);
            if (booking) {
                const extrasText = booking.extras && booking.extras.length 
                    ? '\n\nExtras:\n' + booking.extras.join(', ')
                    : '';
                
                const details = `
Customer: ${booking.customer}
Email: ${booking.email}
Phone: ${booking.phone || 'N/A'}
Item: ${booking.item}
Dates: ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}
Guests: ${booking.guests}
Status: ${booking.status}${booking.description ? '\n\nDescription:\n' + booking.description : ''}${extrasText}

What would you like to do?
                `.trim();
                
                if (confirm(details + '\n\nClick OK to Edit, Cancel to close')) {
                    editBooking(id);
                }
            }
        };

        window.editBooking = function(id) {
            const booking = allBookings.find(b => b.id === id);
            if (booking) {
                editingBookingId = id;
                const names = booking.customer.split(' ');
                const firstName = names[0] || '';
                const lastName = names.slice(1).join(' ') || '';
                
                document.getElementById("modalTitle").textContent = "Edit Booking";
                document.getElementById("submitBookingBtn").textContent = "Update Booking";
                document.getElementById("firstName").value = firstName;
                document.getElementById("lastName").value = lastName;
                document.getElementById("customerEmail").value = booking.email;
                document.getElementById("customerPhone").value = booking.phone || "";
                document.getElementById("bookingItem").value = booking.item;
                document.getElementById("startDate").value = booking.startDate;
                document.getElementById("endDate").value = booking.endDate;
                document.getElementById("guests").value = booking.guests;
                document.getElementById("bookingStatus").value = booking.status;
                document.getElementById("description").value = booking.description || "";
                selectedExtras = booking.extras || [];
                renderExtras();
                document.getElementById("bookingModal").classList.add("active");
            }
        };

        window.deleteBooking = async function(id) {
            if (!confirm("Delete this booking?")) return;

            try {
                const res = await fetch(`${API}/bookings/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token")
                    }
                });

                if (res.ok) {
                    loadBookings();
                } else {
                    alert("Failed to delete booking");
                }
            } catch (err) {
                alert("Error: " + err.message);
            }
        };
    }

});


// ================= FUNCTIONS =================

function loadUsers() {
    fetch(`${API}/admin/users`, {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(data => {

        const usersDiv = document.getElementById("users");
        if (!usersDiv) return;

        usersDiv.innerHTML = "";

        data.forEach(user => {

            const container = document.createElement("div");
            container.style.marginBottom = "10px";

            const text = document.createElement("span");
            text.textContent = `${user.username} (${user.role}) `;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.style.marginTop = "5px";

            deleteBtn.addEventListener("click", () => {
                deleteUser(user.id);
            });

            container.appendChild(text);
            container.appendChild(deleteBtn);

            usersDiv.appendChild(container);

        });

    });
}

function deleteUser(id) {

    fetch(`${API}/admin/users/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        loadUsers(); // reload after delete
    });

}

function parseJwt(token) {
    return JSON.parse(atob(token.split('.')[1]));
}
