const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { execSync, exec } = require('child_process');
const readline = require('readline');

// --- 1. FORÇAR JANELA ULTRA-WIDE (160 Colunas) ---
try {
    execSync('mode con: cols=160 lines=55', { stdio: 'ignore' });
} catch(e) {}

// --- DESIGN SYSTEM ---
const COR_RESET = "\x1b[0m";
const COR_TITULO = "\x1b[93m";    // Amarelo
const COR_OPCAO = "\x1b[97m";     // Branco
const COR_NUMERO = "\x1b[96m";   // Ciano
const COR_DESC = "\x1b[90m";     // Cinza Escuro
const COR_SUCESSO = "\x1b[92m";  // Verde
const COR_ERRO = "\x1b[91m";     // Vermelho
const COR_AVISO = "\x1b[93m";    // Amarelo
const COR_LOGO = "\x1b[36m";     // Ciano Sólido
const COR_MENU_BOX = "\x1b[96m"; // Ciano Brilhante

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const RAIZ_APP = process.cwd(); 

// --- CAMINHOS ---
const PASTA_STEAM = "C:\\Program Files (x86)\\Steam";
const USERDATA_STEAM = path.join(PASTA_STEAM, "userdata");
const STEAM_COMMON = path.join(PASTA_STEAM, "steamapps", "common");
const PASTA_FIXES = path.join(RAIZ_APP, "fixes");
const CONFIG_FILE_PATH = path.join(RAIZ_APP, 'settings.json');
const BANCO_DADOS_PATH = path.join(RAIZ_APP, 'jogos.json');
const PASTA_IMPORT = path.join(RAIZ_APP, "IMPORTAR_SAVES");

// --- CATÁLOGO GIGANTE ---
const CATALOGO_FIXES = {
    "EA GAMES": [
        { nome: "Battlefield 3", busca: "Battlefield 3", zip: "Battlefield 3.zip", pasta: "EA GAMES" },
        { nome: "Battlefield 4", busca: "Battlefield 4", zip: "BATTLEFIELD 4.zip", pasta: "EA GAMES" },
        { nome: "F1 2020", busca: "F1 2020", zip: "F1 2020.zip", pasta: "EA GAMES" }, 
        { nome: "FIFA 21", busca: "FIFA 21", zip: "FIFA 21.zip", pasta: "EA GAMES" }, 
        { nome: "FIFA 22", busca: "FIFA 22", zip: "FIFA 22.zip", pasta: "EA GAMES" }, 
        { nome: "Need for Speed Heat", busca: "Need for Speed Heat", zip: "Need for Speed Heat.zip", pasta: "EA GAMES" },
        { nome: "NFS Most Wanted 2012", busca: "Need for Speed Most Wanted", zip: "NFS MW 2012.zip", pasta: "EA GAMES" }
    ],
    "ROCKSTAR GAMES": [
        { nome: "GTA V Legacy", busca: "Grand Theft Auto V", zip: "Grand Theft Auto V Legacy.zip", pasta: "Rockstar Games" },
        { nome: "GTA IV Complete", busca: "Grand Theft Auto IV", zip: "Grand Theft Auto IV Complete Edition.zip", pasta: "Rockstar Games" },
        { nome: "GTA Trilogy (Definitive)", busca: "Definitive Edition", zip: "GTA III The Definitive Edition.zip", pasta: "Rockstar Games" },
        { nome: "GTA Vice City (Definitive)", busca: "Vice City", zip: "GTA VICE DE.zip", pasta: "Rockstar Games" },
        { nome: "Red Dead Redemption 2", busca: "Red Dead Redemption 2", zip: "Red Dead Redemption 2.zip", pasta: "Rockstar Games" },
        { nome: "Max Payne 3", busca: "Max Payne 3", zip: "Max Payne 3.zip", pasta: "Rockstar Games" }
    ],
    "STEAM (JOGOS GERAIS)": [
        { nome: "BodyCam", busca: "BodyCam", zip: "BodyCam.zip", pasta: "Steam" },
        { nome: "Call of Duty: Black Ops 1", busca: "Black Ops", zip: "Call Of Duty® Black Ops 1.zip", pasta: "Steam" },
        { nome: "Call of Duty: Black Ops 2", busca: "Black Ops II", zip: "Call Of Duty® Black Ops 2.zip", pasta: "Steam" },
        { nome: "Call of Duty: MW3 (2011)", busca: "Modern Warfare 3", zip: "Call Of Duty® MW3 (2011).zip", pasta: "Steam" },
        { nome: "Conan Exiles", busca: "Conan Exiles", zip: "Conan Exiles.zip", pasta: "Steam" },
        { nome: "Dead Island 2", busca: "Dead Island 2", zip: "Dead Island 2.zip", pasta: "Steam" },
        { nome: "Dead Space 2", busca: "Dead Space 2", zip: "Dead Space 2.zip", pasta: "Steam" },
        { nome: "Deadpool", busca: "Deadpool", zip: "Deadpool.zip", pasta: "Steam" },
        { nome: "Doom Eternal", busca: "DOOMEternal", zip: "Doom Eternal.zip", pasta: "Steam" },
        { nome: "Dying Light", busca: "Dying Light", zip: "Dying Light.zip", pasta: "Steam" },
        { nome: "Fallout 4", busca: "Fallout 4", zip: "Fallout 4.zip", pasta: "Steam" },
        { nome: "Hi-Fi RUSH", busca: "Hi-Fi RUSH", zip: "Hi-Fi RUSH.zip", pasta: "Steam" },
        { nome: "Hogwarts Legacy", busca: "Hogwarts Legacy", zip: "Hogwarts Legacy.zip", pasta: "Steam" },
        { nome: "Mad Max", busca: "Mad Max", zip: "Mad Max.zip", pasta: "Steam" },
        { nome: "Ninja Gaiden 4", busca: "Ninja Gaiden", zip: "Ninja Gaiden 4.zip", pasta: "Steam" },
        { nome: "Persona 5 Royal", busca: "Persona 5", zip: "Persona 5 Royal.zip", pasta: "Steam" },
        { nome: "Resident Evil 4 Remake", busca: "Resident Evil 4", zip: "Resident evil 4 Remake.zip", pasta: "Steam" },
        { nome: "Sniper Ghost Warrior", busca: "Sniper Ghost Warrior", zip: "Sniper Ghost Warrior.zip", pasta: "Steam" },
        { nome: "South Park: Stick of Truth", busca: "South Park", zip: "South Park - The Stick of Truth.zip", pasta: "Steam" },
        { nome: "Star Wars Jedi: Fallen Order", busca: "Jedi Fallen Order", zip: "Star Wars Jedi Fallen Order.zip", pasta: "Steam" },
        { nome: "Suicide Squad", busca: "Suicide Squad", zip: "Suicide Squad.zip", pasta: "Steam" }
    ],
    "STEAM (ONLINE FIXES)": [
        { nome: "Forza Horizon 4 (Online)", busca: "ForzaHorizon4", zip: "Forza Horizon 4.zip", pasta: "Steam/Online" },
        { nome: "Forza Horizon 5 (Online)", busca: "ForzaHorizon5", zip: "Forza Horizon 5.zip", pasta: "Steam/Online" },
        { nome: "Forza Motorsport", busca: "Forza Motorsport", zip: "Forza Motorsport.zip", pasta: "Steam/Online" },
        { nome: "Raft (Online)", busca: "Raft", zip: "Raft.zip", pasta: "Steam/Online" },
        { nome: "Liars Bar (Online)", busca: "Liars Bar", zip: "Liars Bar.zip", pasta: "Steam/Online" },
        { nome: "REPO", busca: "REPO", zip: "REPO.zip", pasta: "Steam/Online" }
    ],
    "UBISOFT": [
        { nome: "Assassin's Creed III", busca: "Assassin's Creed III", zip: "Assassin's Creed® III.zip", pasta: "Ubisoft" },
        { nome: "Assassin's Creed IV Black Flag", busca: "Black Flag", zip: "Assassin's Creed® IV Black Flag.zip", pasta: "Ubisoft" },
        { nome: "Assassin's Creed Origins", busca: "Origins", zip: "Assassin's Creed® Origins.zip", pasta: "Ubisoft" },
        { nome: "Assassin's Creed Unity", busca: "Unity", zip: "Assassin's Creed® Unity.zip", pasta: "Ubisoft" },
        { nome: "Far Cry 3", busca: "Far Cry 3", zip: "Far Cry® 3.zip", pasta: "Ubisoft" },
        { nome: "Far Cry 4", busca: "Far Cry 4", zip: "Far Cry® 4.zip", pasta: "Ubisoft" },
        { nome: "Far Cry 5", busca: "Far Cry 5", zip: "Far Cry 5.zip", pasta: "Ubisoft" },
        { nome: "Far Cry Primal", busca: "Primal", zip: "Far Cry Primal.zip", pasta: "Ubisoft" },
        { nome: "Rayman Legends", busca: "Rayman Legends", zip: "Rayman Legends.zip", pasta: "Ubisoft" },
        { nome: "Riders Republic", busca: "Riders Republic", zip: "Riders Republic.zip", pasta: "Ubisoft" },
        { nome: "Star Wars Jedi Survivor", busca: "Jedi Survivor", zip: "Star Wars Jedi Survivor.zip", pasta: "Ubisoft" },
        { nome: "Watch Dogs 1", busca: "Watch_Dogs", zip: "Watch Dogs® 1.zip", pasta: "Ubisoft" },
        { nome: "Watch Dogs 2", busca: "Watch_Dogs 2", zip: "Watch Dogs® 2.zip", pasta: "Ubisoft" },
        { nome: "Watch Dogs Legion", busca: "Legion", zip: "Watch Dogs® Legion.zip", pasta: "Ubisoft" }
    ]
};

// --- FUNÇÕES DE APOIO ---
let CONFIG_USER = { caminhoBackup: path.join(os.homedir(), 'Desktop', 'Meus_Backups_Games') };
function carregarConfig() { try { if (fs.existsSync(CONFIG_FILE_PATH)) CONFIG_USER = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf8')); } catch (e) {} }
carregarConfig();
let DB_JOGOS = {}; try { if(fs.existsSync(BANCO_DADOS_PATH)) DB_JOGOS = JSON.parse(fs.readFileSync(BANCO_DADOS_PATH)); } catch(e){}
function isUserAdmin() { try { execSync('net session', { stdio: 'ignore' }); return true; } catch (e) { return false; } }

// --- PRINT OPCÃO ---
function printOpcao(n, t, d) { 
    console.log(`${COR_NUMERO}${n}.${COR_RESET} ${COR_OPCAO}${t}${COR_RESET}`); 
    if(d) console.log(`${COR_DESC}    └─ ${d}${COR_RESET}`); 
}
function printOpcaoBox(n, t, d) {
    console.log(`     ║ ${COR_NUMERO}${n}.${COR_RESET} ${COR_OPCAO}${t.padEnd(35)}${COR_RESET} ${COR_DESC}${d ? d : ''}${COR_RESET}`);
}

// --- MENU PRINCIPAL ---
function exibirMenu(mensagem = "", tipoMsg = "status") {
    console.clear();
    console.log("\n\n\n"); 

    console.log(COR_LOGO + "             ██╗ ██████╗ ███╗   ██╗ █████╗ ███████╗███╗   ██╗███████╗████████╗ ██████╗  ██████╗ ██╗   ██╗" + COR_RESET);
    console.log(COR_LOGO + "             ██║██╔═══██╗████╗  ██║██╔══██╗██╔════╝████╗  ██║██╔════╝╚══██╔══╝██╔═══██╗██╔═══██╗██║   ██║" + COR_RESET);
    console.log(COR_LOGO + "             ██║██║   ██║██╔██╗ ██║███████║███████╗██╔██╗ ██║█████╗      ██║   ██║   ██║██║   ██║██║   ██║" + COR_RESET);
    console.log(COR_LOGO + "        ██   ██║██║   ██║██║╚██╗██║██╔══██║╚════██║██║╚██╗██║██╔══╝      ██║   ██║   ██║██║   ██║██║   ██║" + COR_RESET);
    console.log(COR_LOGO + "        ╚█████╔╝╚██████╔╝██║ ╚████║██║  ██║███████║██║ ╚████║███████╗   ██║   ╚██████╔╝╚██████╔╝╚██████╔╝" + COR_RESET);
    console.log(COR_LOGO + "         ╚════╝  ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚══════╝   ╚═╝      ╚═════╝  ╚═════╝  ╚═════╝ " + COR_RESET);
    console.log(`\n${COR_TITULO}                                    >> SISTEMA DE GERENCIAMENTO ELITE v16.8 <<${COR_RESET}`);
    
    if (!isUserAdmin()) console.log(`\n${COR_ERRO}    ⚠️  SEM ADMIN! Execute como Administrador.${COR_RESET}`);

    const qtdJogos = Object.keys(DB_JOGOS).length;
    console.log(`\n    📂 Backup: ${COR_AVISO}...${CONFIG_USER.caminhoBackup.slice(-25)}${COR_RESET} | 🎮 Jogos: ${COR_SUCESSO}${qtdJogos}${COR_RESET}`);
    console.log("");

    console.log(COR_DESC + `    ╔══ ${COR_MENU_BOX}PRINCIPAL${COR_DESC} ═══════════════════════════════════════════════════════════════════════════════════╗` + COR_RESET);
    printOpcaoBox("1", "BIBLIOTECA STEAM (26.845 JOGOS)", "Instalar jogos");
    printOpcaoBox("2", "CENTRAL DE SAVES", "Backups, Restauração e Downloads.");
    printOpcaoBox("3", "AUTO-DETECTAR JOGOS", "Rastrear jogos instalados no PC.");
    console.log(COR_DESC + "    ╚════════════════════════════════════════════════════════════════════════════════════════════════╝" + COR_RESET);

    console.log(COR_DESC + `    ╔══ ${COR_MENU_BOX}TÉCNICO & MANUTENÇÃO${COR_DESC} ════════════════════════════════════════════════════════════════════════╗` + COR_RESET);
    printOpcaoBox("4", "MANUTENÇÃO DO PC", "Restaurar Steam, Drivers e Correções.");
    printOpcaoBox("5", "REDE & LAG", "Ping, DNS e Otimização.");
    printOpcaoBox("6", "INSTALAR FIXES", "Correção EA, Rockstar, Ubisoft e Online.");
    console.log(COR_DESC + "    ╚════════════════════════════════════════════════════════════════════════════════════════════════╝" + COR_RESET);

    console.log(COR_DESC + `    ╔══ ${COR_MENU_BOX}EXTRAS${COR_DESC} ══════════════════════════════════════════════════════════════════════════════════════╗` + COR_RESET);
    printOpcaoBox("7", "POWER USER", "Compactar, God Mode, Spacewar.");
    printOpcaoBox("8", "AGENDAR DESLIGAMENTO", "Dormir enquanto baixa.");
    printOpcaoBox("9", "GRAVAÇÃO & GAME BAR", "Overlay do Windows.");
    console.log(COR_DESC + "    ╚════════════════════════════════════════════════════════════════════════════════════════════════╝" + COR_RESET);

    console.log(`${COR_ERRO}    0. Sair${COR_RESET}`);

    console.log("");
    console.log(COR_DESC + "    ╔══════════════════════════════════════════════════════════════════════╗" + COR_RESET);
    console.log(`    ║ ${COR_NUMERO}DEV:${COR_RESET} ${COR_OPCAO}Jonas Cinza${COR_RESET}   ${COR_DESC}|${COR_RESET} ${COR_NUMERO}  WHATSAPP:${COR_RESET} ${COR_OPCAO}(48) 92002-4713${COR_RESET}                     ║`);
    console.log(`    ║ ${COR_NUMERO}EMAIL:${COR_RESET} ${COR_OPCAO}jonasnetoou@gmail.com${COR_RESET}                                         ║`);
    console.log(COR_DESC + "    ╚══════════════════════════════════════════════════════════════════════╝" + COR_RESET);

    if (mensagem) {
        let corMsg = COR_TITULO;
        if (tipoMsg === 'sucesso') corMsg = COR_SUCESSO;
        if (tipoMsg === 'erro') corMsg = COR_ERRO;
        console.log(`\nSTATUS: ${corMsg}${mensagem}${COR_RESET}`);
    }

    rl.question('\n    >>> Opção: ', (opcao) => {
        switch (opcao) {
            case '1': menuBiblioteca(); break; 
            case '2': submenuSaves(); break; 
            case '3': autoDetectar(); break;
            case '4': menuManutencao(); break;
            case '5': menuRede(); break;
            case '6': menuFixesCompleto(); break;
            case '7': menuExtras(); break;
            case '8': menuDesligamento(); break;
            case '9': menuGameBar(); break;
            case '0': rl.close(); process.exit(0); break;
            default: exibirMenu();
        }
    });
}

// --- SUBMENU SAVES ---
function submenuSaves(msg="") {
    console.clear();
    console.log(COR_TITULO + "=== ☁️  CENTRAL DE SAVES ===" + COR_RESET);
    console.log(`${COR_DESC}Pasta de Backup: ${COR_AVISO}${CONFIG_USER.caminhoBackup}${COR_RESET}\n`);
    
    printOpcao("1", "FAZER BACKUP AGORA", "Salva todos os jogos detectados.");
    printOpcao("2", "RESTAURAR SAVE", "Escolha um jogo ou restaure tudo.");
    printOpcao("3", "BAIXAR DA INTERNET", "Download de saves 100%.");
    console.log(COR_DESC + "────────────────────────────────" + COR_RESET);
    printOpcao("4", "CONFIGURAR DESTINO", "Mudar pasta (Drive/Desktop).");
    console.log(`\n${COR_ERRO}0. Voltar${COR_RESET}`);

    if(msg) console.log(`\n${COR_SUCESSO}${msg}${COR_RESET}`);

    rl.question('\nOpção: ', o=>{ 
        switch(o){ 
            case '1': realizarBackupGeral(); break; 
            case '2': restaurarSaveMenu(); break; 
            case '3': menuBaixarSaveInternet(); break; 
            case '4': menuConfiguracao(); break; 
            case '0': exibirMenu(); break; 
            default: submenuSaves(); 
        } 
    }); 
}

// --- BIBLIOTECA (ORDEM INVERTIDA E INSTRUÇÕES) ---
function menuBiblioteca() { 
    console.clear(); 
    console.log(COR_TITULO + "=== 🎮 BIBLIOTECA STEAM ===" + COR_RESET); 
 
    printOpcao("1", "MEGA PACK (26.845 JOGOS)", "Instalação completa"); 
    
const RECUO = "          "; // 10 espaços para afastar da borda
console.log(COR_DESC + " " + COR_RESET);
console.log(COR_DESC + " " + COR_RESET);
    console.log(COR_DESC + "────────────────────────────────────────────────────────────────────────────────────────────────────" + COR_RESET);
console.log(COR_TITULO + "📑 COMO FUNCIONA O SISTEMA (TECNOLOGIA ELITE)" + COR_RESET);
console.log(COR_DESC + "────────────────────────────────────────────────────────────────────────────────────────────────────" + COR_RESET);

console.log(COR_OPCAO + "Diferente de métodos antigos, não usamos sites de terceiros. Usamos o modelo INJETAR E SINCRONIZAR:" + COR_RESET);
console.log("");

console.log(`${COR_NUMERO}1. SINCRONIZAÇÃO NATIVA:${COR_RESET} ${COR_OPCAO}Injetamos metadados (.acf) e caches diretamente na pasta da Steam.${COR_RESET}`);
console.log(`${COR_NUMERO}2. RECONHECIMENTO OFICIAL:${COR_RESET} ${COR_OPCAO}A Steam reconhece nativamente que o jogo já está "instalado" na sua biblioteca.${COR_RESET}`);
console.log(`${COR_NUMERO}3. DOWNLOAD FONTE OFICIAL:${COR_RESET} ${COR_OPCAO}O download vem 100% limpo e atualizado dos servidores oficiais da VALVE.${COR_RESET}`);
console.log(`${COR_NUMERO}4. PAPEL DO FIX (MENU 6):${COR_RESET} ${COR_OPCAO}Liberamos a trava DRM original para o jogo rodar sem licença comprada.${COR_RESET}`);

console.log(COR_DESC + "────────────────────────────────────────────────────────────────────────────────────────────────────" + COR_RESET);
console.log(COR_SUCESSO + "RESUMO: Você troca o risco de sites duvidosos pela segurança do download oficial da Steam." + COR_RESET);
console.log(COR_AVISO + "DICA: Após baixar, você pode remover o MEGA PACK e os jogos continuarão na sua biblioteca!" + COR_RESET);
console.log(COR_DESC + "────────────────────────────────────────────────────────────────────────────────────────────────────" + COR_RESET);

console.log(COR_DESC + "────────────────────────────────────────────────────────────────────────────────────────────────────" + COR_RESET);
console.log(COR_TITULO + "📑 INFORMAÇÕES IMPORTANTES DE INSTALAÇÃO E COMPATIBILIDADE" + COR_RESET);
console.log(COR_DESC + "────────────────────────────────────────────────────────────────────────────────────────────────────" + COR_RESET);

console.log(COR_AVISO + "⚠️  SOBRE A EXECUÇÃO DOS JOGOS:" + COR_RESET);
console.log(COR_OPCAO + "• Alguns títulos podem não iniciar imediatamente após o download oficial da Steam." + COR_RESET);
console.log(COR_OPCAO + "• Nestes casos, é obrigatório aplicar o " + COR_NUMERO + "FIX (CRACK)" + COR_OPCAO + " através do " + COR_NUMERO + "MENU 6." + COR_RESET);
console.log(COR_OPCAO + "• Se o FIX específico não estiver no catálogo, ele pode ser obtido manualmente via busca externa." + COR_RESET);

console.log("");
console.log(COR_AVISO + "📦 GESTÃO DE ARMAZENAMENTO:" + COR_RESET);
console.log(COR_OPCAO + "• Você tem liberdade para instalar quantos jogos desejar simultaneamente." + COR_RESET);
console.log(COR_OPCAO + "• Após a conclusão dos downloads pela Steam, o " + COR_NUMERO + "MEGA PACOTE" + COR_OPCAO + " pode ser removido para liberar espaço." + COR_RESET);
console.log(COR_SUCESSO + "• OS JOGOS PERMANECERÃO RECONHECIDOS NATIVAMENTE NA SUA BIBLIOTECA STEAM." + COR_RESET);

console.log(COR_DESC + "────────────────────────────────────────────────────────────────────────────────────────────────────" + COR_RESET);

    
    rl.question("\n   >>> Opção: ", (opt) => { 
        if(opt=="1") instalarMegapack_26845_Local(); 
        else if(opt=="2") instalarPack721(); 
        else if(opt=="3") rodarScriptAzul(); 
        else exibirMenu(); 
    }); 
}


function instalarMegapack_26845_Local() { 
    console.clear(); 
    console.log("Instalando Megapack 26.845..."); 
    const zipLocal = path.join(RAIZ_APP, 'pack_26845.zip');

    if (!fs.existsSync(zipLocal)) { 
        console.log(COR_ERRO + "\n❌ ERRO: pack_26845.zip não encontrado!" + COR_RESET); 
        return rl.question('Enter...', () => menuBiblioteca()); 
    } 

    try { 
        execSync('taskkill /f /im steam.exe', {stdio:'ignore'}); 
        const appInfo = path.join(PASTA_STEAM, "appcache", "appinfo.vdf"); 
        if(fs.existsSync(appInfo)) fs.unlinkSync(appInfo); 
        console.log("Extraindo arquivos...");
        execSync(`powershell -Command "Expand-Archive -Path '${zipLocal}' -DestinationPath '${PASTA_STEAM}' -Force"`, { stdio: 'inherit' }); 
        console.log("\n" + COR_SUCESSO + "✅ SUCESSO!" + COR_RESET); 
        exec(`start "" "${path.join(PASTA_STEAM, 'steam.exe')}"`); 
    } catch (e) {
        console.log(COR_ERRO + "Erro: " + e.message + COR_RESET);
    }
    rl.question('Enter...', () => menuBiblioteca());
}

// --- FUNÇÃO BACKUP ---
function realizarBackupGeral() { 
    const dest = CONFIG_USER.caminhoBackup; 
    console.log(`\n${COR_AVISO}📂 Iniciando Backup para: ${dest}...${COR_RESET}`); 
    if(dest.includes("G:") && !fs.existsSync("G:\\")) return rl.question("Erro: Google Drive (G:) não encontrado. Enter...", ()=>submenuSaves()); 
    if(Object.keys(DB_JOGOS).length === 0) return rl.question("Nenhum jogo detectado. Use o Radar (Opção 3) antes. Enter...", ()=>submenuSaves()); 
    let s=[], e=[]; 
    for(let id in DB_JOGOS){ 
        const j = DB_JOGOS[id]; 
        let pReal = j.pastaSave.startsWith("userdata") ? path.join(PASTA_STEAM, ...j.pastaSave.split('/')) : path.join(os.homedir(), ...j.pastaSave.split('/')); 
        let pDest = path.join(dest, j.nome.replace(/[<>:"/\\|?*]/g,'')); 
        if(fs.existsSync(pReal)){ 
            try{ 
                if(!fs.existsSync(pDest)) fs.mkdirSync(pDest, {recursive:true}); 
                fs.readdirSync(pReal).forEach(f=>{if(j.filtro==="*" || f.endsWith(j.filtro)) fs.copyFileSync(path.join(pReal,f), path.join(pDest,f));}); 
                s.push(j.nome); 
                console.log(`${COR_SUCESSO}   [OK] ${j.nome}${COR_RESET}`);
            }catch(x){
                e.push(j.nome);
                console.log(`${COR_ERRO}   [ERRO] ${j.nome}${COR_RESET}`);
            } 
        }
    } 
    console.log(`\n${COR_SUCESSO}Resumo: ${s.length} Salvos | ${e.length} Erros${COR_RESET}`); 
    rl.question('Enter para voltar...', ()=>submenuSaves()); 
}

// --- RESTAURAR ---
function restaurarSaveMenu() { 
    const orig = CONFIG_USER.caminhoBackup; 
    if(!fs.existsSync(orig)) return rl.question("Pasta de backup não existe. Enter...", ()=>submenuSaves()); 
    const bks = fs.readdirSync(orig); 
    const val = []; 
    bks.forEach(p => { for(let id in DB_JOGOS){ if(DB_JOGOS[id].nome.replace(/[<>:"/\\|?*]/g,'') === p) val.push({nome:p, id:id}); }}); 
    if(val.length === 0) return rl.question("Nenhum backup compatível encontrado. Enter...", ()=>submenuSaves()); 
    console.clear();
    console.log(COR_TITULO + "=== RESTAURAR BACKUPS ===" + COR_RESET);
    console.log(`${COR_NUMERO}1.${COR_RESET} ${COR_OPCAO}RESTAURAR TUDO (TODOS OS JOGOS)${COR_RESET}`);
    console.log(COR_DESC + "────────────────────────────────" + COR_RESET);
    val.forEach((v,k) => {
        console.log(`${COR_NUMERO}${k+2}.${COR_RESET} ${COR_OPCAO}${v.nome}${COR_RESET}`);
    });
    console.log(`\n${COR_ERRO}0. Voltar${COR_RESET}`);
    rl.question('\nOpção: ', n => { 
        if(n === '0') return submenuSaves();
        if(n === '1') { 
            val.forEach(v => restaurarUnico(v, orig)); 
            return submenuSaves("Todos restaurados!"); 
        } 
        const sel = val[parseInt(n)-2]; 
        if(sel) { 
            restaurarUnico(sel, orig); 
            submenuSaves(`Restaurado: ${sel.nome}`); 
        } else submenuSaves(); 
    }); 
}

function restaurarUnico(d, raiz){ 
    const db=DB_JOGOS[d.id]; 
    let dst = db.pastaSave.startsWith("userdata") ? path.join(PASTA_STEAM, ...db.pastaSave.split('/')) : path.join(os.homedir(), ...db.pastaSave.split('/')); 
    const src = path.join(raiz, d.nome); 
    try{ 
        if(!fs.existsSync(dst)) fs.mkdirSync(dst,{recursive:true}); 
        fs.readdirSync(src).forEach(f=>fs.copyFileSync(path.join(src,f),path.join(dst,f))); 
        console.log(`${COR_SUCESSO}OK: ${d.nome}${COR_RESET}`); 
    }catch(e){console.log(`${COR_ERRO}Erro: ${d.nome}${COR_RESET}`);} 
}

// --- BAIXAR SAVE ---
function menuBaixarSaveInternet() { 
    const ids = Object.keys(DB_JOGOS); 
    if (ids.length === 0) return submenuSaves("Use o Radar (Auto-Detectar) primeiro!"); 
    console.clear(); 
    console.log(COR_TITULO + "=== 🌐 BAIXAR SAVE 100% ===" + COR_RESET); 
    ids.forEach((id,i) => printOpcao(i+1, DB_JOGOS[id].nome, "")); 
    console.log(`\n${COR_ERRO}0. Voltar${COR_RESET}`); 
    rl.question('\nQual jogo? ', n => { 
        if(n==='0') return submenuSaves(); 
        const j=ids[parseInt(n)-1]; 
        if(j) fluxoInstalacaoSave({id:j, nome:DB_JOGOS[j].nome}); 
        else submenuSaves(); 
    }); 
}

// --- CONFIGURAÇÃO ---
function menuConfiguracao() { 
    console.clear(); 
    console.log(COR_TITULO + "=== ⚙️ CONFIGURAR DESTINO ===" + COR_RESET); 
    printOpcao("1", "DESKTOP", "Pasta 'Meus_Backups_Games' na área de trabalho.");
    printOpcao("2", "GOOGLE DRIVE", "Salva direto no Drive (G:).");
    printOpcao("3", "CAMINHO PERSONALIZADO", "Digite o caminho que quiser.");
    console.log(`\n${COR_ERRO}0. Cancelar${COR_RESET}`);
    rl.question('\nOpção: ', o => { 
        if(o==='1') salvarConfig(path.join(os.homedir(),'Desktop','Meus_Backups_Games')); 
        else if(o==='2') salvarConfig("G:\\Meu Drive\\Save Piratas"); 
        else if(o==='3') rl.question('Digite o caminho: ', c => salvarConfig(c.replace(/"/g,''))); 
        else submenuSaves(); 
    }); 
}

// --- MENUS FIXES ---
function menuFixesCompleto() {
    console.clear();
    console.log(COR_TITULO + "=== 📦 CENTRAL DE CORREÇÕES ===" + COR_RESET);
    const categorias = Object.keys(CATALOGO_FIXES);
    categorias.forEach((cat, index) => {
        printOpcao(index + 1, cat, `${CATALOGO_FIXES[cat].length} Jogos disponíveis`);
    });
    console.log(COR_DESC + "────────────────────────────────" + COR_RESET);
    printOpcao("99", "Instalar ZIP Local (Genérico)", "Para arquivos fora do catálogo");
    console.log(`${COR_ERRO}0. Voltar${COR_RESET}`);
    rl.question('\nOpção: ', (n) => {
        if (n === '0') return exibirMenu();
        if (n === '99') return instalarZipManual();
        const catIndex = parseInt(n) - 1;
        if (categorias[catIndex]) submenuCategoriaFix(categorias[catIndex]);
        else menuFixesCompleto();
    });
}

function submenuCategoriaFix(categoria) {
    console.clear();
    console.log(COR_TITULO + `=== ${categoria} ===` + COR_RESET);
    const jogos = CATALOGO_FIXES[categoria];
    jogos.forEach((jogo, i) => {
        printOpcao(i + 1, jogo.nome, `Fix: ${jogo.zip}`);
    });
    console.log(`\n${COR_ERRO}0. Voltar${COR_RESET}`);
    rl.question('\nQual jogo corrigir? ', (n) => {
        if (n === '0') return menuFixesCompleto();
        const selecionado = jogos[parseInt(n) - 1];
        if (selecionado) aplicarFix(selecionado);
        else submenuCategoriaFix(categoria);
    });
}

function menuManutencao() {
    console.clear();
    console.log(COR_TITULO + "=== 🛠️  MANUTENÇÃO DO PC ===" + COR_RESET);
    printOpcao("1", "RESTAURAR STEAM ORIGINAL", "Remove todos os cracks (Protocol Zero).");
    printOpcao("2", "ATUALIZAR DRIVERS GPU", "Links para Nvidia, AMD e Intel.");
    printOpcao("3", "MODO ALTO DESEMPENHO", "Foca energia do Windows em FPS.");
    printOpcao("4", "PROTEÇÃO ANTI-DEFENDER", "Impede que o Windows apague seus cracks.");
    printOpcao("5", "INSTALAR KIT MÉDICO", "Visual C++ e DirectX (Corrige erros de dll).");
    printOpcao("6", "INFO DO PC", "Ver Processador, Memória e Disco.");
    console.log(`\n${COR_ERRO}0. Voltar${COR_RESET}`);
    rl.question('\nOpção: ', (opt) => {
        if(opt=='1') restaurarSteamOriginal(); else if(opt=='2') atualizarDriversGPU(); else if(opt=='3') ativarModoDesempenho();
        else if(opt=='4') adicionarExclusaoDefender(); else if(opt=='5') abrirKitMedico(); else if(opt=='6') mostrarInfoPC();
        else exibirMenu();
    });
}

function menuExtras() {
    console.clear();
    console.log(COR_TITULO + "=== 🌀 EXTRAS ===" + COR_RESET);
    printOpcao("1", "GOD MODE", "Pasta secreta com todos os ajustes do Windows.");
    printOpcao("2", "SPACEWAR", "Instala o jogo base para Multiplayer Pirata.");
    printOpcao("3", "COMPACTAR WINDOWS", "Comprime o sistema para ganhar espaço.");
    printOpcao("4", "ATIVAR DIRECTPLAY", "Necessário para GTA San Andreas e jogos antigos.");
    printOpcao("5", "DETETIVE SAVE", "Abre a Wiki para achar onde fica o save.");
    printOpcao("6", "CRIAR ATALHO", "Põe o ícone do Manager na Área de Trabalho.");
    printOpcao("7", "MATAR FANTASHAS", "Fecha Steam travada.");
    printOpcao("8", "LIMPAR LIXO STEAM", "Apaga instaladores DirectX inúteis.");
    printOpcao("9", "RESET FABRICA", "Reseta o app.");
    console.log(`\n${COR_ERRO}0. Voltar${COR_RESET}`);
    rl.question('\nOpção: ', o=>{
        if(o=='1') explicarGodMode(); else if(o=='2') explicarSpacewar(); else if(o=='3') compactarWindows();
        else if(o=='4') ativarDirectPlay(); else if(o=='5') buscarWikiSave(); else if(o=='6') criarAtalhoDesktop();
        else if(o=='7') matarFantasmas(); else if(o=='8') limparCommonRedist(); else if(o=='9') resetarFabrica();
        else exibirMenu();
    });
}

function menuRede() { 
    console.clear(); 
    console.log(COR_TITULO + "=== 📡 OTIMIZAÇÃO DE REDE ===" + COR_RESET); 
    printOpcao("1", "PING WATCHER", "Monitora conexão."); 
    printOpcao("2", "TURBO TCP/IP", "Reduz lag."); 
    printOpcao("3", "RESETAR DNS", "Limpa cache."); 
    printOpcao("4", "PAUSAR UPDATES", "Para downloads do Windows."); 
    console.log(`\n${COR_ERRO}0. Voltar${COR_RESET}`); 
    rl.question('\nOpção: ', o=>{ 
        if(o=='1')abrirPingWatcher(); else if(o=='2')otimizarTCP(); else if(o=='3')resetarDNS(); else if(o=='4')pausarUpdates(); else exibirMenu(); 
    }); 
}

function menuDesligamento() { 
    console.clear(); 
    console.log(COR_TITULO + "=== ⏲️ AGENDAR DESLIGAMENTO ===" + COR_RESET); 
    printOpcao("1","30 Minutos",""); 
    printOpcao("2","1 Hora",""); 
    printOpcao("3","2 Horas",""); 
    printOpcao("4","Custom",""); 
    printOpcao("5","Cancelar",""); 
    console.log(`\n${COR_ERRO}0. Voltar${COR_RESET}`);
    rl.question('\nOpção: ', o=>{ if(o==='1')ag(30);else if(o==='2')ag(60);else if(o==='3')ag(120);else if(o==='4')rl.question('Min: ',m=>ag(parseInt(m)));else if(o==='5'){try{execSync('shutdown /a');exibirMenu("Cancelado!","sucesso");}catch(e){}}else exibirMenu();});
} 

function menuGameBar() { 
    console.clear(); 
    console.log(COR_TITULO + "=== 🎥 GRAVAÇÃO ===" + COR_RESET); 
    printOpcao("1","ABRIR OVERLAY","Win+G"); 
    printOpcao("2","ABRIR PASTA VÍDEOS","Onde ficam os clipes");
    printOpcao("3","REPARAR","Se não abrir"); 
    console.log(`\n${COR_ERRO}0. Voltar${COR_RESET}`);
    rl.question('\nOpção: ',o=>{if(o==='1')emularWinG();else if(o==='2'){const p=path.join(os.homedir(),'Vídeos','Captures');let a=fs.existsSync(p)?p:path.join(os.homedir(),'Videos');exec(`explorer "${a}"`);}else if(o==='3')repararGameBar();else exibirMenu();});
}

// --- LÓGICA DE INSTALAÇÃO DE SAVE ---
function salvarConfig(c){ CONFIG_USER.caminhoBackup=c; try{fs.writeFileSync(CONFIG_FILE_PATH,JSON.stringify(CONFIG_USER,null,2));submenuSaves("Salvo!");}catch(e){submenuSaves("Erro");}}
function fluxoInstalacaoSave(j){ console.clear(); console.log(`=== ${j.nome} ===`); try{fs.readdirSync(PASTA_IMPORT).forEach(f=>fs.unlinkSync(path.join(PASTA_IMPORT,f)));}catch(e){} exec(`start https://www.google.com/search?q=${j.nome.replace(/ /g,'+')}+save+game+100%25`); exec(`start "" "${PASTA_IMPORT}"`); rl.question('\nPonha os arquivos na pasta e dê ENTER.',()=>{ instalarArquivosImportados(j); }); }
function instalarArquivosImportados(j){ const db=DB_JOGOS[j.id]; let dest = db.pastaSave.startsWith("userdata") ? path.join(PASTA_STEAM, ...db.pastaSave.split('/')) : path.join(os.homedir(), ...db.pastaSave.split('/')); try{ if(!fs.existsSync(dest)) fs.mkdirSync(dest,{recursive:true}); fs.readdirSync(PASTA_IMPORT).forEach(f=>{ const o=path.join(PASTA_IMPORT,f); if(fs.lstatSync(o).isFile()){ fs.copyFileSync(o,path.join(dest,f)); fs.unlinkSync(o); } }); console.log("Sucesso!"); }catch(e){console.log("Erro.");} rl.question('Enter...', ()=>submenuSaves()); }

// --- UTILITÁRIOS ---
function rodarScriptAzul() {
    console.clear();
    console.log(COR_TITULO + ">>> LIMPANDO CACHE DA STEAM..." + COR_RESET);
    try {
        const appInfo = path.join(PASTA_STEAM, "appcache", "appinfo.vdf");
        if (fs.existsSync(appInfo)) {
            fs.unlinkSync(appInfo);
            console.log(COR_SUCESSO + "✅ Cache da Steam limpo com sucesso!" + COR_RESET);
        } else {
            console.log(COR_AVISO + "ℹ️ Cache da Steam já estava limpo ou não encontrado." + COR_RESET);
        }
    } catch (e) {
        console.log(COR_ERRO + "Erro ao limpar o cache da Steam: " + e.message + COR_RESET);
    }
    rl.question('Enter para voltar...', () => menuBiblioteca());
}
function abrirPingWatcher() { exec('start cmd /k "color 0A && title PING && ping 8.8.8.8 -t"'); rl.question('Enter...', () => menuRede()); }
function otimizarTCP() { try{execSync('netsh int tcp set global autotuninglevel=normal');execSync('netsh int tcp set global rss=enabled');console.log("OK!");}catch(e){} rl.question('Enter...', ()=>menuRede()); }
function pausarUpdates() { try{exec('start ms-settings:windowsupdate');}catch(e){} rl.question('Enter...', ()=>menuRede()); }
function compactarWindows() { try{execSync('compact.exe /CompactOS:always',{stdio:'inherit'});}catch(e){} rl.question('Enter...', ()=>menuExtras()); }
function ativarDirectPlay() { try{execSync('dism /online /enable-feature /featurename:DirectPlay /all /norestart',{stdio:'inherit'});}catch(e){} rl.question('Enter...', ()=>menuExtras()); }
function atualizarDriversGPU() { try{const g=execSync('wmic cpu get name').toString().toLowerCase(); if(g.includes('nvidia'))exec('start https://www.nvidia.com.br/Download/index.aspx?lang=br'); else if(g.includes('amd'))exec('start https://www.amd.com/pt/support');}catch(e){} rl.question('Enter...', ()=>menuManutencao()); }
function ativarModoDesempenho() { try{execSync('powercfg -s 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c', {stdio:'ignore'});}catch(e){} rl.question('Enter...', ()=>menuManutencao()); }
function adicionarExclusaoDefender() { try{execSync(`powershell -Command "Add-MpPreference -ExclusionPath '${PASTA_STEAM}'"`);}catch(e){} rl.question('Enter...', ()=>menuManutencao()); }
function abrirKitMedico() { exec('start https://github.com/abbodi1406/vcredist/releases'); rl.question('Enter...', ()=>menuManutencao()); }
function mostrarInfoPC() { console.clear(); try{const cpu=execSync('wmic cpu get name').toString().split('\n')[1].trim(); console.log(`CPU: ${cpu}`); }catch(e){} rl.question('Enter...', ()=>menuManutencao()); }
function resetarDNS() { try{execSync('ipconfig /flushdns');}catch(e){} rl.question('Enter...', ()=>menuRede()); }
function resetarFabrica() { if(fs.existsSync(CONFIG_FILE_PATH))fs.unlinkSync(CONFIG_FILE_PATH); exibirMenu("Resetado!"); }
function explicarGodMode() { const p=path.join(os.homedir(),'Desktop',"God Mode.{ED7BA470-8E54-465E-825C-99712043E01C}"); if(!fs.existsSync(p))fs.mkdirSync(p); exec(`explorer "${p}"`); rl.question('Enter...', ()=>menuExtras()); }
function explicarSpacewar() { exec('start steam://install/480'); exibirMenu("Verifique Steam!", "sucesso"); }
function buscarWikiSave() { rl.question('Jogo: ', n=>{ if(n.length>1)exec(`start https://www.pcgamingwiki.com/w/index.php?search=${n.trim().replace(/ /g,'+')}`); rl.question('Enter...', ()=>menuExtras()); }); }
function criarAtalhoDesktop() { const vbs=path.join(os.tmpdir(),'c.vbs'), d=path.join(os.homedir(),'Desktop','Jonasnetoou Manager.lnk'); fs.writeFileSync(vbs, `Set W=WScript.CreateObject("WScript.Shell")\nSet L=W.CreateShortcut("${d}")\nL.TargetPath="${process.execPath}"\nL.WorkingDirectory="${RAIZ_APP}"\nL.Save`); try{execSync(`cscript //nologo "${vbs}"`); fs.unlinkSync(vbs);}catch(e){} rl.question('Enter...', ()=>menuExtras()); }
function matarFantasmas() { try{execSync('taskkill /f /im steam.exe', {stdio:'ignore'});}catch(e){} rl.question('Enter...', ()=>menuExtras()); }
function limparCommonRedist() { if(fs.existsSync(STEAM_COMMON)){ fs.readdirSync(STEAM_COMMON).forEach(j=>{ const p=path.join(STEAM_COMMON,j); if(fs.lstatSync(p).isDirectory()){ ['_CommonRedist','Redist'].forEach(r=>{ const t=path.join(p,r); if(fs.existsSync(t)) try{execSync(`rmdir /s /q "${t}"`);}catch(e){} }); } }); } rl.question('Enter...', ()=>menuExtras()); }
function ag(m){try{execSync(`shutdown /s /t ${m*60}`);exibirMenu(`Desliga em ${m}m`,"sucesso");}catch(e){}}
function instalarZipManual() { const f=fs.readdirSync(PASTA_FIXES).filter(x=>x.endsWith('.zip')); if(f.length===0){return rl.question('Sem zips. Enter...',()=>menuFixesCompleto());} f.forEach((x,i)=>console.log(`${i+1}. ${x}`)); rl.question('Opção: ',n=>{const fix=f[parseInt(n)-1]; if(fix) { const jgs=fs.readdirSync(STEAM_COMMON); jgs.forEach((x,i)=>console.log(`${i+1}. ${x}`)); rl.question('Jogo: ',nj=>{const gj=jgs[parseInt(nj)-1]; if(gj)try{execSync(`powershell -Command "Expand-Archive -Path '${path.join(PASTA_FIXES,fix)}' -DestinationPath '${path.join(STEAM_COMMON,gj)}' -Force"`);}catch(e){} rl.question('Enter...',()=>menuFixesCompleto());}); } else menuFixesCompleto(); }); }

function aplicarFix(fixInfo) { console.log(`\n🔍 Procurando: ${fixInfo.busca}...`); const pastas = fs.readdirSync(STEAM_COMMON); const pastaJogo = pastas.find(p => p.toLowerCase().includes(fixInfo.busca.toLowerCase())); if (!pastaJogo) return rl.question('Jogo não instalado. Enter...', () => menuFixesCompleto()); const caminhoJogo = path.join(STEAM_COMMON, pastaJogo); const caminhoZip = path.join(PASTA_FIXES, fixInfo.pasta, fixInfo.zip); if (!fs.existsSync(caminhoZip)) return rl.question('Fix não encontrado. Enter...', () => menuFixesCompleto()); try { execSync(`powershell -Command "Expand-Archive -Path '${caminhoZip}' -DestinationPath '${caminhoJogo}' -Force"`, { stdio: 'inherit' }); } catch (e) {} rl.question('Enter...', () => menuFixesCompleto()); }

function restaurarSteamOriginal(){
    console.clear();
    console.log("=== RESTAURAR STEAM ORIGINAL ===");
    rl.question('\nDigite SIM para confirmar: ', r=>{
        if(r.toUpperCase()!=='SIM') return menuManutencao();
        try{execSync('taskkill /f /im steam.exe',{stdio:'ignore'});}catch(e){}
        const alvos=["hid.dll","xinput1_4.dll","xinput1_3.dll","version.dll","winmm.dll","Steam.cfg","GreenLuma_*.dll","DLLInjector.*","UserList.txt"];
        alvos.forEach(a=>{ try{ if(a.includes("*")){ fs.readdirSync(PASTA_STEAM).filter(f=>f.startsWith("GreenLuma")).forEach(f=>fs.unlinkSync(path.join(PASTA_STEAM,f))); }else{ const p=path.join(PASTA_STEAM,a); if(fs.existsSync(p)) fs.unlinkSync(p); } }catch(e){} });
        const d=path.join(PASTA_STEAM,"config","depotcache"); 
        if(fs.existsSync(d))try{execSync(`rmdir /s /q "${d}"`,{stdio:'ignore'});}catch(e){}
        exec(`start "" "${path.join(PASTA_STEAM,'steam.exe')}"`);
        rl.question('Concluído. Enter...',()=>menuManutencao());
    });
}

function obterNomeSteam(appId) { return new Promise((resolve) => { const url = `https://store.steampowered.com/api/appdetails?appids=${appId}`; https.get(url, (res) => { let dados = ''; res.on('data', (chunk) => dados += chunk); res.on('end', () => { try { const json = JSON.parse(dados); if (json[appId] && json[appId].success) resolve(json[appId].data.name); else resolve(`Jogo ID ${appId}`); } catch (e) { resolve(`Jogo ID ${appId}`); } }); }).on('error', () => resolve(`Jogo ID ${appId}`)); }); }
async function autoDetectar() { 
    console.clear();
    console.log(COR_TITULO + "=== 🛰️  RADAR DE JOGOS (SCANEANDO) ===" + COR_RESET); 
    
    if (!fs.existsSync(USERDATA_STEAM)) return exibirMenu("Sem userdata.", "erro"); 
    
    const contas = fs.readdirSync(USERDATA_STEAM); 
    let n = 0; 
    
    for (const u of contas) { 
        const p = path.join(USERDATA_STEAM, u); 
        if (fs.lstatSync(p).isDirectory() && !isNaN(u)) { 
            const jgs = fs.readdirSync(p).filter(f => !isNaN(f)); 
            for (const app of jgs) { 
                if (!DB_JOGOS[app] && app.length > 3) { 
                    // LINHA ADICIONADA:
                    console.log(`${COR_AVISO}🔍 Buscando dados do AppID: ${app}...${COR_RESET}`);
                    
                    const nome = await obterNomeSteam(app); 
                    
                    // LINHA ADICIONADA:
                    console.log(`${COR_SUCESSO}   ✅ Encontrado: ${COR_OPCAO}${nome}${COR_RESET}`);
                    
                    DB_JOGOS[app] = { "nome": nome, "pastaSave": `userdata/${u}/${app}/remote`, "filtro": "*" }; 
                    n++; 
                } 
            } 
        } 
    } 
    
 if (n > 0) { 
        fs.writeFileSync(BANCO_DADOS_PATH, JSON.stringify(DB_JOGOS, null, 2)); 
        console.log(`\n${COR_SUCESSO}>>> Escaneamento concluído! ${n} novos jogos adicionados.${COR_RESET}`);
        // ESTA LINHA ABAIXO É A CHAVE: Ela trava a tela para você ler os nomes
        rl.question('\nPressione ENTER para voltar ao menu principal...', () => exibirMenu(`${n} novos!`, "sucesso")); 
    } else {
        exibirMenu(`Nada novo encontrado.`, "aviso"); 
    }
}
function emularWinG(){ const s=`$c=@"\nusing System; using System.Runtime.InteropServices; public class K{[DllImport("user32.dll")]public static extern void keybd_event(byte b,byte s,uint f,uint e);public static void P(){keybd_event(0x5B,0,0,0);keybd_event(0x47,0,0,0);keybd_event(0x47,0,2,0);keybd_event(0x5B,0,2,0);}}\n"@\nAdd-Type -TypeDefinition $c -Language CSharp\n[K]::P()`; const t=path.join(os.tmpdir(),'w.ps1'); try{fs.writeFileSync(t,s);execSync(`powershell -Ep Bypass -WindowStyle Hidden -File "${t}"`);}catch(e){} rl.question('Enter...',()=>menuGameBar());}
function repararGameBar(){try{execSync('powershell -Command "Get-AppxPackage Microsoft.XboxGamingOverlay | Foreach {Add-AppxPackage -DisableDevelopmentMode -Register \\"$($_.InstallLocation)\\AppXManifest.xml\\"}"',{stdio:'ignore'});}catch(e){} rl.question('Enter...',()=>menuGameBar());}

// *** START ***
exibirMenu();