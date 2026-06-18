// ----------------------------
    // Mock data
    // ----------------------------
    const platformData = [
      { name: "Amazon", count: 5420, percent: 43.4 },
      { name: "Flipkart", count: 3180, percent: 25.5 },
      { name: "Shopify", count: 2146, percent: 17.2 },
      { name: "Myntra", count: 1120, percent: 9.0 },
      { name: "Other", count: 620, percent: 4.9 }
    ];

    const issueData = [
      { name: "Delivery Delay", mentions: 486, change: 18 },
      { name: "Damaged Packaging", mentions: 354, change: 12 },
      { name: "Product Quality", mentions: 298, change: -8 },
      { name: "Size or Fit Issue", mentions: 214, change: 4 },
      { name: "Refund Delay", mentions: 186, change: -3 }
    ];

    let products = [
      { name:"Wireless Earbuds X1", platform:"Amazon", reviews:3248, rating:3.6, positive:54, negative:648, trend:-12, status:"Critical", icon:"fa-headphones" },
      { name:"Smartwatch Pro S2", platform:"Flipkart", reviews:2784, rating:4.1, positive:67, negative:278, trend:4, status:"Stable", icon:"fa-clock" },
      { name:"Running Shoes Flex", platform:"Myntra", reviews:2140, rating:4.5, positive:79, negative:128, trend:9, status:"Excellent", icon:"fa-shoe-prints" },
      { name:"Organic Face Serum", platform:"Shopify", reviews:1892, rating:4.3, positive:73, negative:151, trend:6, status:"Excellent", icon:"fa-droplet" },
      { name:"Laptop Sleeve Premium", platform:"Amazon", reviews:1622, rating:3.9, positive:61, negative:211, trend:-3, status:"Needs Attention", icon:"fa-laptop" }
    ];

    const reviews = [
      {
        id:1, customer:"Sarah Khan", initials:"SK", platform:"Amazon", rating:1, date:"18 Jun 2026",
        product:"Wireless Earbuds X1", issue:"Damaged Product", sentiment:"negative", priority:"urgent",
        text:"The package arrived crushed and the charging case was cracked. I need a replacement urgently because this was meant to be a birthday gift."
      },
      {
        id:2, customer:"Rahul Mehta", initials:"RM", platform:"Flipkart", rating:1, date:"17 Jun 2026",
        product:"Running Shoes Flex", issue:"Delivery Delay", sentiment:"negative", priority:"urgent",
        text:"The order arrived six days late and I missed the event I purchased these shoes for. Tracking information was not updated."
      },
      {
        id:3, customer:"Neha Verma", initials:"NV", platform:"Shopify", rating:2, date:"17 Jun 2026",
        product:"Organic Face Serum", issue:"Refund Delay", sentiment:"negative", priority:"urgent",
        text:"My return was approved ten days ago but the refund is still not visible. Support keeps asking me to wait without giving a clear timeline."
      },
      {
        id:4, customer:"Arjun Patel", initials:"AP", platform:"Amazon", rating:1, date:"16 Jun 2026",
        product:"Smartwatch Pro S2", issue:"Product Defect", sentiment:"negative", priority:"urgent",
        text:"The watch disconnects every few minutes and the heart-rate sensor stops working during workouts. Resetting did not solve the issue."
      }
    ];

    const recommendations = [
      { title:"Investigate packaging complaints for Wireless Earbuds X1", priority:"High", impact:"Reduce one-star reviews", owner:"Operations" },
      { title:"Contact the delivery partner regarding delays in North India", priority:"High", impact:"Improve delivery sentiment", owner:"Logistics" },
      { title:"Update the Smartwatch Pro S2 product description", priority:"Medium", impact:"Set clearer expectations", owner:"Product" },
      { title:"Prioritize responses to 48 critical reviews", priority:"High", impact:"Improve response SLA", owner:"Support" },
      { title:"Share positive customer feedback with the marketing team", priority:"Low", impact:"Strengthen campaigns", owner:"Marketing" }
    ];

    const activities = [
      ["fa-star","New one-star review received on Amazon","2 minutes ago"],
      ["fa-reply","Customer Support replied to a Flipkart review","18 minutes ago"],
      ["fa-box-open","Packaging complaints increased by 12%","45 minutes ago"],
      ["fa-tags","Twenty reviews were automatically categorized","1 hour ago"],
      ["fa-file-lines","Weekly report was generated","3 hours ago"]
    ];

    const integrations = [
      { name:"Amazon", status:"Connected", sync:"Synced 8 minutes ago", ok:true },
      { name:"Flipkart", status:"Connected", sync:"Synced 12 minutes ago", ok:true },
      { name:"Shopify", status:"Connected", sync:"Synced 4 minutes ago", ok:true },
      { name:"Myntra", status:"Action Required", sync:"Authentication expired", ok:false }
    ];

    let activeReview = null;
    let currentReviewFilter = "all";
    let sortDirection = 1;

    // ----------------------------
    // Rendering helpers
    // ----------------------------
    const formatNumber = n => n.toLocaleString("en-IN");
    const statusClass = status => ({
      "Excellent":"excellent", "Stable":"stable", "Needs Attention":"attention", "Critical":"critical"
    })[status] || "stable";

    function showToast(message) {
      const toast = document.getElementById("toast");
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(window.toastTimer);
      window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
    }

    function renderPlatforms() {
      document.getElementById("platformRows").innerHTML = platformData.map(item => `
        <div class="platform-row" data-platform="${item.name.toLowerCase()}">
          <div class="platform-meta">
            <span><strong>${item.name}</strong></span>
            <span>${formatNumber(item.count)} · ${item.percent}%</span>
          </div>
          <div class="progress"><span style="width:${item.percent}%"></span></div>
        </div>
      `).join("");
    }

    function renderIssues() {
      const max = Math.max(...issueData.map(x => x.mentions));
      document.getElementById("issueRows").innerHTML = issueData.map(item => `
        <div class="issue-row">
          <span><strong>${item.name}</strong><br><small style="color:var(--muted)">${item.mentions} mentions</small></span>
          <div class="issue-bar"><span style="width:${(item.mentions/max)*100}%"></span></div>
          <span class="issue-change ${item.change < 0 ? "good":"bad"}">
            <i class="fa-solid fa-arrow-${item.change < 0 ? "down":"up"}"></i> ${Math.abs(item.change)}%
          </span>
        </div>
      `).join("");
    }

    function renderProducts(list = products) {
      const tbody = document.getElementById("productTableBody");
      tbody.innerHTML = list.map(p => `
        <tr data-search="${(p.name+" "+p.platform+" "+p.status).toLowerCase()}">
          <td><div class="product-cell"><div class="product-thumb"><i class="fa-solid ${p.icon}"></i></div><strong>${p.name}</strong></div></td>
          <td>${p.platform}</td>
          <td>${formatNumber(p.reviews)}</td>
          <td><i class="fa-solid fa-star" style="color:#f59e0b"></i> ${p.rating}</td>
          <td><span class="up">${p.positive}%</span></td>
          <td>${p.negative}</td>
          <td class="${p.trend >= 0 ? "up":"warn"}"><i class="fa-solid fa-arrow-${p.trend >= 0 ? "up":"down"}"></i> ${Math.abs(p.trend)}%</td>
          <td><span class="badge ${statusClass(p.status)}">${p.status}</span></td>
          <td><button class="btn btn-secondary btn-sm view-product" data-product="${p.name}">View Details</button></td>
        </tr>
      `).join("");
    }

    function renderReviews() {
      const query = document.getElementById("globalSearch").value.trim().toLowerCase();
      const platform = document.getElementById("platformFilter").value;
      const filtered = reviews.filter(r => {
        const filterMatch = currentReviewFilter === "all" || r.sentiment === currentReviewFilter || r.priority === currentReviewFilter;
        const platformMatch = platform === "All Platforms" || r.platform === platform;
        const queryMatch = !query || (r.customer+" "+r.product+" "+r.issue+" "+r.text+" "+r.platform).toLowerCase().includes(query);
        return filterMatch && platformMatch && queryMatch;
      });

      document.getElementById("reviewsGrid").innerHTML = filtered.length ? filtered.map(r => `
        <article class="review-item ${r.resolved ? "resolved":""}" data-id="${r.id}">
          <div class="review-head">
            <div class="review-person">
              <div class="avatar">${r.initials}</div>
              <div><strong>${r.customer}</strong><small>${r.platform} · ${r.date}</small></div>
            </div>
            <div><div class="stars">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</div></div>
          </div>
          <div class="review-product">${r.product}</div>
          <div class="review-text">${r.text}</div>
          <div class="tags">
            <span class="tag">${r.issue}</span>
            <span class="tag negative">Negative</span>
            <span class="tag urgent">High Priority</span>
          </div>
          <div class="review-actions">
            <button class="btn btn-secondary btn-sm reply-btn" data-id="${r.id}"><i class="fa-solid fa-reply"></i> Reply</button>
            <button class="btn btn-primary btn-sm ai-reply-btn" data-id="${r.id}"><i class="fa-solid fa-wand-magic-sparkles"></i> Generate AI Reply</button>
            <button class="btn btn-secondary btn-sm resolve-btn" data-id="${r.id}" ${r.resolved ? "disabled":""}>
              <i class="fa-regular fa-circle-check"></i> ${r.resolved ? "Resolved":"Mark as Resolved"}
            </button>
          </div>
        </article>
      `).join("") : `<div class="empty-state"><i class="fa-solid fa-magnifying-glass"></i><p>No reviews match the selected filters.</p></div>`;
    }

    function renderRecommendations() {
      document.getElementById("recommendationGrid").innerHTML = recommendations.map((r,i) => `
        <article class="recommendation">
          <span class="badge ${r.priority === "High" ? "critical" : r.priority === "Medium" ? "attention":"stable"}">${r.priority} priority</span>
          <h4>${r.title}</h4>
          <div class="recommendation-meta">
            <div><strong>Expected impact:</strong> ${r.impact}</div>
            <div><strong>Suggested owner:</strong> ${r.owner}</div>
          </div>
          <button class="btn btn-secondary btn-sm take-action" data-action="${i}" style="margin-top:12px;width:100%">Take Action</button>
        </article>
      `).join("");
    }

    function renderActivity() {
      document.getElementById("activityTimeline").innerHTML = activities.map(a => `
        <div class="timeline-item">
          <div class="timeline-icon"><i class="fa-solid ${a[0]}"></i></div>
          <div><strong>${a[1]}</strong><span>${a[2]}</span></div>
        </div>
      `).join("");
    }

    function renderIntegrations() {
      document.getElementById("integrationGrid").innerHTML = integrations.map(i => `
        <article class="integration">
          <div class="integration-top">
            <div class="integration-name"><i class="fa-solid fa-store"></i>${i.name}</div>
            <span class="badge ${i.ok ? "excellent":"critical"}">${i.status}</span>
          </div>
          <p>${i.sync}</p>
          <button class="btn btn-secondary btn-sm manage-integration" data-name="${i.name}">Manage Integration</button>
        </article>
      `).join("");
    }

    // ----------------------------
    // Charts
    // ----------------------------
    Chart.defaults.font.family = "Inter";
    Chart.defaults.color = getComputedStyle(document.body).getPropertyValue("--muted").trim();

    const trendCtx = document.getElementById("trendChart");
    const sentimentCtx = document.getElementById("sentimentChart");

    const trendSets = {
      7: {
        labels:["12 Jun","13 Jun","14 Jun","15 Jun","16 Jun","17 Jun","18 Jun"],
        total:[330,355,348,402,430,416,468],
        positive:[210,230,226,270,294,281,325],
        negative:[55,51,49,58,61,63,57]
      },
      30: {
        labels:["20 May","24 May","28 May","1 Jun","5 Jun","9 Jun","13 Jun","18 Jun"],
        total:[280,315,342,338,371,395,420,468],
        positive:[176,205,222,226,246,270,288,325],
        negative:[48,54,50,52,58,62,60,57]
      },
      90: {
        labels:["Mar 20","Apr 1","Apr 15","May 1","May 15","Jun 1","Jun 18"],
        total:[220,248,275,310,350,390,468],
        positive:[130,148,171,199,230,265,325],
        negative:[58,61,64,63,60,59,57]
      }
    };

    let trendChart = new Chart(trendCtx, {
      type:"line",
      data:{
        labels:trendSets[30].labels,
        datasets:[
          { label:"Total Reviews", data:trendSets[30].total, borderColor:"#5b5bd6", backgroundColor:"rgba(91,91,214,.10)", fill:true, tension:.35, borderWidth:2 },
          { label:"Positive", data:trendSets[30].positive, borderColor:"#16a34a", tension:.35, borderWidth:2 },
          { label:"Negative", data:trendSets[30].negative, borderColor:"#dc2626", tension:.35, borderWidth:2 }
        ]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        interaction:{mode:"index",intersect:false},
        plugins:{legend:{position:"bottom",labels:{usePointStyle:true,boxWidth:8}}},
        scales:{
          x:{grid:{display:false}},
          y:{beginAtZero:true,grid:{color:"rgba(148,163,184,.13)"}}
        }
      }
    });

    let sentimentChart = new Chart(sentimentCtx, {
      type:"doughnut",
      data:{ labels:["Positive","Neutral","Negative"], datasets:[{ data:[68,20,12], backgroundColor:["#16a34a","#d97706","#dc2626"], borderWidth:0 }]},
      options:{ responsive:true, maintainAspectRatio:false, cutout:"70%", plugins:{legend:{display:false}} }
    });

    function updateTrend(days) {
      const d = trendSets[days];
      trendChart.data.labels = d.labels;
      trendChart.data.datasets[0].data = d.total;
      trendChart.data.datasets[1].data = d.positive;
      trendChart.data.datasets[2].data = d.negative;
      trendChart.update();
      showToast(`Trend updated to the last ${days} days.`);
    }

    // ----------------------------
    // Interactions
    // ----------------------------
    const sidebar = document.getElementById("sidebar");
    const main = document.getElementById("main");
    const overlay = document.getElementById("overlay");
    const aiModal = document.getElementById("aiModal");
    const detailsDrawer = document.getElementById("detailsDrawer");

    document.getElementById("sidebarToggle").addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      main.classList.toggle("expanded");
      const icon = document.querySelector("#sidebarToggle i");
      icon.className = sidebar.classList.contains("collapsed") ? "fa-solid fa-chevron-right" : "fa-solid fa-chevron-left";
    });

    document.getElementById("mobileMenu").addEventListener("click", () => {
      sidebar.classList.add("mobile-open");
      overlay.classList.add("show");
    });

    function closePanels() {
      aiModal.classList.remove("show");
      detailsDrawer.classList.remove("show");
      sidebar.classList.remove("mobile-open");
      overlay.classList.remove("show");
    }
    overlay.addEventListener("click", closePanels);
    document.getElementById("closeModal").addEventListener("click", closePanels);
    document.getElementById("closeDrawer").addEventListener("click", closePanels);

    document.getElementById("darkToggle").addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const icon = document.querySelector("#darkToggle i");
      icon.className = document.body.classList.contains("dark") ? "fa-regular fa-sun" : "fa-regular fa-moon";
      showToast(document.body.classList.contains("dark") ? "Dark mode enabled." : "Light mode enabled.");
    });

    document.getElementById("dateFilter").addEventListener("change", e => {
      const days = e.target.value.includes("7") ? 7 : e.target.value.includes("90") ? 90 : 30;
      document.querySelectorAll("#trendTabs .tab-btn").forEach(b => b.classList.toggle("active", Number(b.dataset.days) === days));
      updateTrend(days);
    });

    document.getElementById("platformFilter").addEventListener("change", () => {
      renderReviews();
      showToast("Platform filter applied.");
    });

    document.getElementById("globalSearch").addEventListener("input", e => {
      const query = e.target.value.toLowerCase();
      renderReviews();
      const filtered = products.filter(p => (p.name+" "+p.platform+" "+p.status).toLowerCase().includes(query));
      renderProducts(filtered);
    });

    document.getElementById("productSearch").addEventListener("input", e => {
      const q = e.target.value.toLowerCase();
      renderProducts(products.filter(p => (p.name+" "+p.platform+" "+p.status).toLowerCase().includes(q)));
    });

    document.querySelectorAll("#trendTabs .tab-btn").forEach(btn => btn.addEventListener("click", () => {
      document.querySelectorAll("#trendTabs .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updateTrend(Number(btn.dataset.days));
      document.getElementById("dateFilter").value = `Last ${btn.dataset.days} days`;
    }));

    document.querySelectorAll("th[data-sort]").forEach(th => th.addEventListener("click", () => {
      const key = th.dataset.sort;
      products.sort((a,b) => {
        const x = a[key], y = b[key];
        if (typeof x === "string") return x.localeCompare(y) * sortDirection;
        return (x-y) * sortDirection;
      });
      sortDirection *= -1;
      renderProducts();
      showToast(`Products sorted by ${th.textContent.trim()}.`);
    }));

    document.getElementById("reviewTabs").addEventListener("click", e => {
      if (!e.target.matches(".tab-btn")) return;
      document.querySelectorAll("#reviewTabs .tab-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      currentReviewFilter = e.target.dataset.filter;
      renderReviews();
    });

    function responseFor(tone, review) {
      const first = review.customer.split(" ")[0];
      const base = {
        empathetic:`Hi ${first}, we’re sorry ${review.issue.toLowerCase()} affected your experience. This is not the standard we want for our customers. We have shared the issue with the relevant team and would like to resolve it as quickly as possible. Please check your messages so we can assist you further.`,
        professional:`Hello ${first}, thank you for bringing this issue to our attention. We regret the inconvenience caused by the ${review.issue.toLowerCase()}. Our support team has escalated the matter and will contact you with the next steps. We appreciate your patience.`,
        friendly:`Hi ${first}, thanks for letting us know about this. We’re really sorry about the ${review.issue.toLowerCase()} and want to make it right. Our team is already looking into it, and we’ll message you shortly with a solution.`
      };
      return base[tone];
    }

    function openAiModal(id) {
      activeReview = reviews.find(r => r.id === Number(id));
      document.getElementById("modalReviewText").textContent = activeReview.text;
      document.getElementById("aiResponse").value = responseFor("empathetic", activeReview);
      document.querySelectorAll(".tone-btn").forEach((b,i) => b.classList.toggle("active", i===0));
      overlay.classList.add("show");
      aiModal.classList.add("show");
    }

    document.getElementById("reviewsGrid").addEventListener("click", e => {
      const aiBtn = e.target.closest(".ai-reply-btn");
      const replyBtn = e.target.closest(".reply-btn");
      const resolveBtn = e.target.closest(".resolve-btn");
      if (aiBtn) openAiModal(aiBtn.dataset.id);
      if (replyBtn) {
        openAiModal(replyBtn.dataset.id);
        showToast("Reply editor opened.");
      }
      if (resolveBtn) {
        const r = reviews.find(x => x.id === Number(resolveBtn.dataset.id));
        r.resolved = true;
        renderReviews();
        showToast("Review marked as resolved.");
      }
    });

    document.getElementById("toneGrid").addEventListener("click", e => {
      if (!e.target.matches(".tone-btn") || !activeReview) return;
      document.querySelectorAll(".tone-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      document.getElementById("aiResponse").value = responseFor(e.target.dataset.tone, activeReview);
    });

    document.getElementById("regenerateBtn").addEventListener("click", () => {
      const activeTone = document.querySelector(".tone-btn.active").dataset.tone;
      document.getElementById("aiResponse").value = responseFor(activeTone, activeReview) + " We value your feedback and will use it to improve our service.";
      showToast("A new response was generated.");
    });

    document.getElementById("copyBtn").addEventListener("click", async () => {
      const text = document.getElementById("aiResponse").value;
      try {
        await navigator.clipboard.writeText(text);
        showToast("Response copied to clipboard.");
      } catch {
        document.getElementById("aiResponse").select();
        document.execCommand("copy");
        showToast("Response copied to clipboard.");
      }
    });

    document.getElementById("sendReplyBtn").addEventListener("click", () => {
      if (activeReview) activeReview.resolved = true;
      closePanels();
      renderReviews();
      showToast("Reply sent successfully.");
    });

    document.getElementById("detailsBtn").addEventListener("click", () => {
      overlay.classList.add("show");
      detailsDrawer.classList.add("show");
    });
    document.getElementById("drawerAction").addEventListener("click", () => {
      closePanels(); showToast("AI action plan created.");
    });

    document.getElementById("exportBtn").addEventListener("click", () => {
      const rows = [
        ["Metric","Value"],
        ["Total Reviews","12486"],
        ["Average Rating","4.2"],
        ["Positive Sentiment","68%"],
        ["Negative Reviews","1248"],
        ["Pending Responses","326"]
      ];
      const csv = rows.map(r => r.join(",")).join("\n");
      const blob = new Blob([csv], {type:"text/csv"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "reviewpulse-report.csv"; a.click();
      URL.revokeObjectURL(url);
      showToast("Report exported successfully.");
    });

    document.getElementById("recommendationGrid").addEventListener("click", e => {
      const btn = e.target.closest(".take-action");
      if (!btn) return;
      btn.textContent = "Action Created";
      btn.disabled = true;
      showToast("Recommended action added to the task list.");
    });

    document.getElementById("integrationGrid").addEventListener("click", e => {
      const btn = e.target.closest(".manage-integration");
      if (!btn) return;
      showToast(`${btn.dataset.name} integration settings opened.`);
    });

    document.getElementById("addPlatformBtn").addEventListener("click", () => showToast("Platform connection wizard opened."));

    document.getElementById("productTableBody").addEventListener("click", e => {
      const btn = e.target.closest(".view-product");
      if (!btn) return;
      document.querySelector("#detailsDrawer h3").textContent = btn.dataset.product;
      document.querySelector("#detailsDrawer p").innerHTML = `<strong>Product insight:</strong> Performance details, sentiment drivers, recurring issues and recommended next steps for ${btn.dataset.product}.`;
      overlay.classList.add("show");
      detailsDrawer.classList.add("show");
    });

    document.querySelectorAll(".nav-item").forEach(item => item.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
      item.classList.add("active");
      if (window.innerWidth <= 1050) closePanels();
    }));

    // Initial rendering
    renderPlatforms();
    renderIssues();
    renderProducts();
    renderReviews();
    renderRecommendations();
    renderActivity();
    renderIntegrations();
