// Internationalization: English and Portuguese translations

import type { AppLanguage } from "@/types/audiometry";

const translations = {
  English: {
    // Title screen
    start: "Start",
    practice: "Practice",
    calibration: "Calibration",
    viewResults: "View Results",
    noCalibration: "No active calibration. Please calibrate first.",
    noResults: "No patient results available.",

    // Calibration
    calibrationTitle: "Calibration",
    frequency: "Frequency",
    play: "Play",
    expectedLevel: "Expected Level",
    presentationLevel: "Presentation Level",
    measuredLeft: "Measured Left",
    measuredRight: "Measured Right",
    saveNew: "Save New",
    updateCurrent: "Update Current",
    loadCalibration: "Load Calibration",
    deleteCurrent: "Delete Current",
    fillDefaults: "Fill Defaults",
    clearMeasured: "Clear Measured",
    calibrationName: "Calibration Name",
    returnToTitle: "Return to Title",

    // Protocol
    protocolSetup: "Protocol Setup",
    patientName: "Patient Name",
    patientGroup: "Patient Group",
    frequencySequence: "Frequency Sequence",
    addFrequency: "Add Frequency",
    removeLast: "Remove Last",
    clearAll: "Clear All",
    leftFirst: "Left First",
    rightFirst: "Right First",
    leftOnly: "Left Only",
    rightOnly: "Right Only",
    english: "English",
    portuguese: "Português",
    saveProtocol: "Save Protocol",
    loadProtocol: "Load Protocol",
    deleteProtocol: "Delete Protocol",
    startAdultTest: "Start Adult Test",
    startChildrenTest: "Start Children Test",

    // Test
    startTesting: "Start Testing",
    repeat: "Repeat",
    pause: "Pause",
    resume: "Resume",
    noSound: "No Sound",
    testProgress: "Test Progress",
    currentFrequency: "Current Frequency",
    currentEar: "Current Ear",
    leftEar: "Left Ear",
    rightEar: "Right Ear",
    firstInterval: "First",
    secondInterval: "Second",

    // Instructions
    adultInstruction: "You will hear sounds through the headphones. Please tap the interval button where you hear the sound, or tap \"No Sound\" if you don't hear anything.",
    childrenInstruction: "Listen carefully! Tap the picture where the animal is hiding when you hear the sound. If you don't hear anything, tap the question mark!",

    // Ear switch
    earSwitchTitle: "Switch Earphone",
    earSwitchMessage: "Please move the earphone to the other ear.",
    continueAfterSwitch: "Continue After Switching the Earphone",

    // Results
    results: "Results",
    exportAll: "Export All Patient Data",
    deleteAllProfiles: "Delete All Patient Profiles",
    deleteCurrentProfile: "Delete Current Patient Profile",
    threshold: "Threshold",
    reliability: "Reliability",
    noResponse: "NR",
    leftChannel: "Left",
    rightChannel: "Right",
    exportCSV: "Export CSV",
    noData: "No data available",

    // Common
    adult: "Adult",
    children: "Children",
    practiceMode: "Practice Mode",
    testMode: "Test Mode",
    hz: "Hz",
    db: "dB",

    // Spam
    spamWarning: "Please listen carefully before responding. Avoid pressing the same button repeatedly.",
  },
  Portuguese: {
    start: "Iniciar",
    practice: "Prática",
    calibration: "Calibração",
    viewResults: "Ver Resultados",
    noCalibration: "Nenhuma calibração ativa. Calibre primeiro.",
    noResults: "Nenhum resultado de paciente disponível.",

    calibrationTitle: "Calibração",
    frequency: "Frequência",
    play: "Tocar",
    expectedLevel: "Nível Esperado",
    presentationLevel: "Nível de Apresentação",
    measuredLeft: "Medido Esquerdo",
    measuredRight: "Medido Direito",
    saveNew: "Salvar Novo",
    updateCurrent: "Atualizar Atual",
    loadCalibration: "Carregar Calibração",
    deleteCurrent: "Excluir Atual",
    fillDefaults: "Preencher Padrão",
    clearMeasured: "Limpar Medidos",
    calibrationName: "Nome da Calibração",
    returnToTitle: "Voltar ao Início",

    protocolSetup: "Configuração de Protocolo",
    patientName: "Nome do Paciente",
    patientGroup: "Grupo do Paciente",
    frequencySequence: "Sequência de Frequências",
    addFrequency: "Adicionar Frequência",
    removeLast: "Remover Última",
    clearAll: "Limpar Tudo",
    leftFirst: "Esquerda Primeiro",
    rightFirst: "Direita Primeiro",
    leftOnly: "Somente Esquerda",
    rightOnly: "Somente Direita",
    english: "English",
    portuguese: "Português",
    saveProtocol: "Salvar Protocolo",
    loadProtocol: "Carregar Protocolo",
    deleteProtocol: "Excluir Protocolo",
    startAdultTest: "Iniciar Teste Adulto",
    startChildrenTest: "Iniciar Teste Infantil",

    startTesting: "Iniciar Teste",
    repeat: "Repetir",
    pause: "Pausar",
    resume: "Continuar",
    noSound: "Silêncio",
    testProgress: "Progresso do Teste",
    currentFrequency: "Frequência Atual",
    currentEar: "Orelha Atual",
    leftEar: "Orelha Esquerda",
    rightEar: "Orelha Direita",
    firstInterval: "Primeiro",
    secondInterval: "Segundo",

    adultInstruction: "Você ouvirá sons pelo fone de ouvido. Toque no botão do intervalo onde ouviu o som, ou toque em \"Silêncio\" se não ouvir nada.",
    childrenInstruction: "Escute com atenção! Toque na imagem onde o bichinho está escondido quando ouvir o som. Se não ouvir nada, toque no ponto de interrogação!",

    earSwitchTitle: "Trocar Fone",
    earSwitchMessage: "Por favor, mude o fone de ouvido para a outra orelha.",
    continueAfterSwitch: "Continuar Após Trocar o Fone",

    results: "Resultados",
    exportAll: "Exportar Todos os Dados",
    deleteAllProfiles: "Excluir Todos os Perfis",
    deleteCurrentProfile: "Excluir Perfil Atual",
    threshold: "Limiar",
    reliability: "Confiabilidade",
    noResponse: "NR",
    leftChannel: "Esquerda",
    rightChannel: "Direita",
    exportCSV: "Exportar CSV",
    noData: "Sem dados disponíveis",

    adult: "Adulto",
    children: "Infantil",
    practiceMode: "Modo Prática",
    testMode: "Modo Teste",
    hz: "Hz",
    db: "dB",

    spamWarning: "Por favor, escute com atenção antes de responder. Evite pressionar o mesmo botão repetidamente.",
  },
} as const;

export type TranslationKey = keyof typeof translations.English;

export function t(key: TranslationKey, language: AppLanguage): string {
  return translations[language][key] ?? translations.English[key] ?? key;
}

export default translations;
