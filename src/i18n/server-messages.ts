/**
 * Messages produced by the API and by Laravel itself. The backend ships no
 * `lang` directory, so validation and auth failures arrive as English free
 * text. They are not part of the UI dictionary (they arrive at runtime and are
 * not addressable by a dotted key), but they still have to reach the user in
 * the active language, so they are mapped explicitly here.
 *
 * SERVER_MESSAGES: raw server text -> dictionary key.
 * SERVER_ERROR_MESSAGES: dictionary key -> { en, it }.
 *
 * When adding a mapping, translate the key in both languages: an unmapped
 * server message degrades to the original English text rather than breaking.
 */
export const SERVER_MESSAGES: Record<string, string> = {
  // API client / transport
  "Unable to establish a secure session. Please try again.":
    "errors.secureSession",
  "The server returned an unexpected response. Please try again.":
    "errors.unexpectedResponse",
  "Unable to complete this request.": "errors.unableToComplete",
  "Cannot connect to the server. Please retry.": "errors.cannotConnect",

  // Laravel authentication / authorization
  "Please sign in to this account area.": "errors.signInRequired",
  "Unauthenticated.": "errors.unauthenticated",
  "This action is unauthorized.": "errors.unauthorized",
  "Page not found.": "errors.notFound",
  "Too Many Attempts.": "errors.tooManyAttempts",

  // Laravel validation
  "The credentials you provided are incorrect.": "errors.credentials",
  "The credentials are invalid or the account is unavailable.":
    "errors.credentialsUnavailable",
  "This reset link is invalid or expired.": "errors.resetLinkExpired",
  "The email field is required.": "errors.fieldRequired",
  "The password field is required.": "errors.fieldRequired",
  "The confirmation field is required.": "errors.fieldRequired",
  "The name field is required.": "errors.fieldRequired",
  "The email has already been taken.": "errors.emailTaken",
  "The password confirmation does not match.": "errors.passwordMismatch",
  "Passwords do not match": "errors.passwordMismatch",
  "The password must be at least 12 characters.": "errors.passwordLength",
  "The provided password is incorrect.": "errors.currentPassword",
  "The resource was updated by another user.": "errors.staleRecord",
  "This record has changed since you loaded it.": "errors.staleRecord",
  "Your session has expired. Please sign in again.": "errors.sessionExpired",

  // Domain validation (OpticalBackend app messages)
  "Amount exceeds the supported limit.": "errors.amountLimit",
  "Choose a supported currency.": "errors.unsupportedCurrency",
  "This category name already exists.": "errors.categoryExists",
  "This SKU already exists in your catalog.": "errors.skuExists",
  "Expiry must be after the recorded date.": "errors.expiryBeforeDate",
  "End must be after start, within 24 hours.": "errors.invalidRange",
  "Select the linked glasses record.": "errors.glassesRequired",
  "Select a compatible Vista category.": "errors.vistaCategoryRequired",
  "Choose a subcategory within the selected category.":
    "errors.vistaSubcategoryRequired",
  "Select an existing worksheet.": "errors.worksheetRequired",
  "This field is unavailable for the selected category.":
    "errors.fieldUnavailable",
  "Option allocations must equal the chosen total allocation.":
    "errors.allocationMismatch",
  "A customer is required for private customer images.":
    "errors.customerRequired",

  // Imports and documents (file validation)
  "A header row and at least one data row are required.": "errors.headerAndRows",
  "A header row and data are required.": "errors.headerRequired",
  "Headers must contain literal values.": "errors.headersLiteral",
  "CSV must use UTF-8 encoding.": "errors.csvEncoding",
  "A cell exceeds 4,096 bytes.": "errors.cellTooLarge",
  "Maximum 32 source columns.": "errors.maxColumns",
  "Maximum 5,000 data rows per import.": "errors.maxRows",
  "Selected worksheet exceeds 5,000 data rows or 32 columns.":
    "errors.sheetTooLarge",
  "This is not a valid XLSX workbook.": "errors.invalidXlsx",
  "Invalid Office document.": "errors.invalidOffice",
  "Unsupported or oversized Office container. Macros and embedded objects are not accepted.":
    "errors.officeUnsupported",
  "Workbook has external links, active content or exceeds safe expansion limits.":
    "errors.workbookUnsafe",
  "Choose a PNG or JPEG photograph.": "errors.imageType",
  "Customer and glasses images must be PNG or JPEG files.":
    "errors.imageType",
  "Customer and glasses images must be PNG or JPEG.": "errors.imageType",
  "Invalid image or image dimensions exceed 25 megapixels.":
    "errors.imageTooLarge",
  "Image dimensions must not exceed 25 megapixels.": "errors.imageTooLarge",
  "File contents do not match an allowed document format.":
    "errors.fileTypeMismatch",
};

export const SERVER_ERROR_MESSAGES: Record<string, { en: string; it: string }> = {
  "errors.secureSession": {
    en: "Unable to establish a secure session. Please try again.",
    it: "Impossibile stabilire una sessione sicura. Riprova.",
  },
  "errors.unexpectedResponse": {
    en: "The server returned an unexpected response. Please try again.",
    it: "Il server ha restituito una risposta inattesa. Riprova.",
  },
  "errors.unableToComplete": {
    en: "Unable to complete this request.",
    it: "Impossibile completare la richiesta.",
  },
  "errors.cannotConnect": {
    en: "Cannot connect to the server. Please retry.",
    it: "Impossibile connettersi al server. Riprova.",
  },
  "errors.signInRequired": {
    en: "Please sign in to this account area.",
    it: "Accedi per accedere a questa area.",
  },
  "errors.unauthenticated": {
    en: "Unauthenticated.",
    it: "Accesso non autenticato.",
  },
  "errors.unauthorized": {
    en: "This action is unauthorized.",
    it: "Questa azione non è autorizzata.",
  },
  "errors.notFound": {
    en: "Page not found.",
    it: "Pagina non trovata.",
  },
  "errors.tooManyAttempts": {
    en: "Too many attempts. Please wait a moment and try again.",
    it: "Troppi tentativi. Attendi qualche istante e riprova.",
  },
  "errors.credentials": {
    en: "The credentials you provided are incorrect.",
    it: "Le credenziali fornite non sono corrette.",
  },
  "errors.credentialsUnavailable": {
    en: "The credentials are invalid or the account is unavailable.",
    it: "Le credenziali non sono valide oppure l'account non è disponibile.",
  },
  "errors.resetLinkExpired": {
    en: "This reset link is invalid or expired.",
    it: "Questo link di reimpostazione non è valido o è scaduto.",
  },
  "errors.fieldRequired": {
    en: "This field is required.",
    it: "Questo campo è obbligatorio.",
  },
  "errors.emailTaken": {
    en: "The email has already been taken.",
    it: "Questa email è già registrata.",
  },
  "errors.passwordMismatch": {
    en: "The password confirmation does not match.",
    it: "La conferma password non corrisponde.",
  },
  "errors.passwordLength": {
    en: "The password must be at least 12 characters.",
    it: "La password deve contenere almeno 12 caratteri.",
  },
  "errors.currentPassword": {
    en: "The provided password is incorrect.",
    it: "La password attuale non è corretta.",
  },
  "errors.staleRecord": {
    en: "This record has changed since you loaded it. Refresh and try again.",
    it: "Questo record è stato modificato. Aggiorna e riprova.",
  },
  "errors.sessionExpired": {
    en: "Your session has expired. Please sign in again.",
    it: "La sessione è scaduta. Accedi di nuovo.",
  },
  "errors.amountLimit": {
    en: "Amount exceeds the supported limit.",
    it: "L'importo supera il limite supportato.",
  },
  "errors.unsupportedCurrency": {
    en: "Choose a supported currency.",
    it: "Scegli una valuta supportata.",
  },
  "errors.categoryExists": {
    en: "This category name already exists.",
    it: "Questo nome di categoria esiste già.",
  },
  "errors.skuExists": {
    en: "This SKU already exists in your catalog.",
    it: "Questo SKU esiste già nel catalogo.",
  },
  "errors.expiryBeforeDate": {
    en: "Expiry must be after the recorded date.",
    it: "La scadenza deve essere successiva alla data registrata.",
  },
  "errors.invalidRange": {
    en: "End must be after start, within 24 hours.",
    it: "La fine deve essere successiva all'inizio, entro 24 ore.",
  },
  "errors.glassesRequired": {
    en: "Select the linked glasses record.",
    it: "Seleziona il record degli occhiali collegato.",
  },
  "errors.vistaCategoryRequired": {
    en: "Select a compatible Vista category.",
    it: "Seleziona una categoria Vista compatibile.",
  },
  "errors.vistaSubcategoryRequired": {
    en: "Choose a subcategory within the selected category.",
    it: "Scegli una sottocategoria della categoria selezionata.",
  },
  "errors.worksheetRequired": {
    en: "Select an existing worksheet.",
    it: "Seleziona un foglio di lavoro esistente.",
  },
  "errors.fieldUnavailable": {
    en: "This field is unavailable for the selected category.",
    it: "Questo campo non è disponibile per la categoria selezionata.",
  },
  "errors.allocationMismatch": {
    en: "Option allocations must equal the chosen total allocation.",
    it: "Le allocazioni delle opzioni devono coincidere con l'allocazione totale scelta.",
  },
  "errors.customerRequired": {
    en: "A customer is required for private customer images.",
    it: "Un cliente è obbligatorio per le immagini riservate ai clienti.",
  },
  "errors.headerAndRows": {
    en: "A header row and at least one data row are required.",
    it: "Sono necessari un'intestazione e almeno una riga di dati.",
  },
  "errors.headerRequired": {
    en: "A header row and data are required.",
    it: "Sono necessari un'intestazione e dei dati.",
  },
  "errors.headersLiteral": {
    en: "Headers must contain literal values.",
    it: "Le intestazioni devono contenere valori letterali.",
  },
  "errors.csvEncoding": {
    en: "CSV must use UTF-8 encoding.",
    it: "Il file CSV deve usare la codifica UTF-8.",
  },
  "errors.cellTooLarge": {
    en: "A cell exceeds 4,096 bytes.",
    it: "Una cella supera i 4.096 byte.",
  },
  "errors.maxColumns": {
    en: "Maximum 32 source columns.",
    it: "Massimo 32 colonne di origine.",
  },
  "errors.maxRows": {
    en: "Maximum 5,000 data rows per import.",
    it: "Massimo 5.000 righe di dati per importazione.",
  },
  "errors.sheetTooLarge": {
    en: "Selected worksheet exceeds 5,000 data rows or 32 columns.",
    it: "Il foglio selezionato supera 5.000 righe di dati o 32 colonne.",
  },
  "errors.invalidXlsx": {
    en: "This is not a valid XLSX workbook.",
    it: "Questo non è un file XLSX valido.",
  },
  "errors.invalidOffice": {
    en: "Invalid Office document.",
    it: "Documento Office non valido.",
  },
  "errors.officeUnsupported": {
    en: "Unsupported or oversized Office container. Macros and embedded objects are not accepted.",
    it: "Contenitore Office non supportato o troppo grande. Macro e oggetti incorporati non sono accettati.",
  },
  "errors.workbookUnsafe": {
    en: "Workbook has external links, active content or exceeds safe expansion limits.",
    it: "Il foglio di lavoro contiene collegamenti esterni, contenuti attivi o supera i limiti di espansione sicura.",
  },
  "errors.imageType": {
    en: "Choose a PNG or JPEG photograph.",
    it: "Scegli una fotografia PNG o JPEG.",
  },
  "errors.imageTooLarge": {
    en: "Image dimensions must not exceed 25 megapixels.",
    it: "Le dimensioni dell'immagine non devono superare 25 megapixel.",
  },
  "errors.fileTypeMismatch": {
    en: "File contents do not match an allowed document format.",
    it: "Il contenuto del file non corrisponde a un formato documento consentito.",
  },
};
