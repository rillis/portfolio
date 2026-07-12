let languages = [];
let languagesSelected = [];
let colors = {};
let reposData = [];

// Controle de toggle dos filtros
function langua(l) {
    let lsLen = languagesSelected.length;
    let lLen = languages.length;

    if (lsLen === lLen) {
        languagesSelected = [l];
    } else {
        if (!languagesSelected.includes(l)) {
            languagesSelected.push(l);
        } else {
            const index = languagesSelected.indexOf(l);
            if (index > -1) {
                languagesSelected.splice(index, 1);
            }
        }
    }
    
    if (languagesSelected.length === 0) {
        languagesSelected = [...languages];
    }
    
    renderView();
}

// Renderiza o DOM
function renderView() {
    const portfolio = document.getElementById('portfolio');
    
    // Renderiza Ribbon (Filtros)
    let html = `
        <div class="mb-10">
            <h2 class="text-sm uppercase tracking-wider text-gray-400 mb-4 font-semibold">Filtros por Linguagem</h2>
            <div class="flex flex-wrap gap-2" id="languageRibbon">
    `;

    languages.forEach(item => {
        const isActive = languagesSelected.includes(item);
        const colorCode = colors[item] ? colors[item].color : '#ccc';
        
        const baseClasses = "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer border select-none";
        const activeClasses = isActive 
            ? "bg-gray-800 border-gray-600 text-gray-100 shadow-sm" 
            : "bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300 opacity-60";

        html += `
            <span class="${baseClasses} ${activeClasses}" onclick="langua('${item}')">
                <span class="w-3 h-3 rounded-full" style="background-color: ${colorCode}"></span>
                ${item}
            </span>
        `;
    });

    html += `</div></div>`;

    // Renderiza Cards
    html += `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;

    reposData.forEach(item => {
        // Validação da linguagem nula para Markdown
        let lang = item.language;
        if (!lang) {
            lang = "Markdown";
        }

        if (languagesSelected.includes(lang) || languagesSelected.length === 0) {
            const name = item.name;
            const desc = item.description || "Sem descrição disponível.";
            const url = item.html_url;
            const colorCode = colors[lang] ? colors[lang].color : '#888';

            html += `
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="block group h-full">
                    <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col justify-between h-full transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 hover:shadow-blue-500/20">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-100 group-hover:text-blue-400 transition-colors mb-2 break-words">
                                ${name}
                            </h3>
                            <p class="text-sm text-gray-400 mb-4 line-clamp-3">
                                ${desc}
                            </p>
                        </div>
                        <div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-700/50">
                            <div class="flex items-center gap-2">
                                <span class="w-3 h-3 rounded-full shadow-sm" style="background-color: ${colorCode}"></span>
                                <span class="text-xs text-gray-300 font-medium">${lang}</span>
                            </div>
                            <span class="text-xs font-semibold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Source ↗</span>
                        </div>
                    </div>
                </a>
            `;
        }
    });

    html += `</div>`;
    portfolio.innerHTML = html;
}

// Fetch dos dados (sem jQuery)
async function update() {
    try {
        const [colorsResponse, reposResponse] = await Promise.all([
            fetch("https://raw.githubusercontent.com/ozh/github-colors/master/colors.json"),
            fetch("https://api.github.com/users/rillis/repos?per_page=100&sort=created")
        ]);

        colors = await colorsResponse.json();
        reposData = await reposResponse.json();

        // Extrai linguagens únicas
        reposData.forEach(item => {
            let lang = item.language;
            if (!lang) {
                lang = "Markdown";
            }
            if (!languages.includes(lang)) {
                languages.push(lang);
            }
        });
        
        languagesSelected = [...languages];
        renderView();

    } catch (error) {
        console.error("Falha ao carregar dados da API:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    update();
});