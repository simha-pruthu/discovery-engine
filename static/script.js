function addCompetitor() {
    const container = document.getElementById("competitorContainer");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "competitorInput";
    input.placeholder = "Enter competitor name";

    container.appendChild(input);
}

function generateDiscovery() {
    const company = document.getElementById("companyInput").value;

    const competitorInputs = document.querySelectorAll(".competitorInput");
    const competitors = [];

    competitorInputs.forEach(input => {
        if (input.value.trim() !== "") {
            competitors.push(input.value.trim());
        }
    });

    fetch("/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            company: company,
            competitors: competitors
        })
    })
    .then(res => res.json())
    .then(data => renderOutput(data));
}

function renderOutput(data) {
    const panel = document.querySelector(".output-panel");
    panel.innerHTML = "";

    const overviewCard = createCard("Overview", data.overview);
    panel.appendChild(overviewCard);

    const compCard = createCard(
        "Competitor Analysis",
        data.competitor_analysis.join("<br><br>")
    );
    panel.appendChild(compCard);

    const oppCard = createCard("Opportunities", data.opportunities);
    panel.appendChild(oppCard);
}

function createCard(title, content) {
    const card = document.createElement("div");
    card.className = "output-card";

    card.innerHTML = `
        <h3>${title}</h3>
        <p>${content}</p>
    `;

    return card;
}