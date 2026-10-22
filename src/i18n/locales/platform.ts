import type { LocaleModule } from "../types";

const en = {
  "platform.shopsTitle": "Shop accounts",
  "platform.manageShop": "Manage shop",
  "platform.reviewRegistration": "Review registration",
  "platform.suspend": "Suspend",
  "platform.activate": "Activate",
  "platform.confirmActivate": "Activate {name}?",
  "platform.confirmSuspend": "Suspend {name}?",
  "platform.statusUpdated": "Shop status updated.",

  "platform.registrationDetails": "Registration details",
  "platform.detail.phone": "Business phone",
  "platform.detail.address": "Street address",
  "platform.detail.city": "City",
  "platform.detail.postalCode": "Postal code / CAP",
  "platform.detail.country": "Country",
  "platform.detail.timezone": "Time zone",
  "platform.notSuppliedExisting": "Not supplied (existing account)",
  "platform.shopOwner": "Shop owner",
  "platform.emailVerified": "Email verified",
  "platform.emailVerificationPending": "Email verification pending",
  "platform.verifiedBadge": "Verified",
  "platform.awaitingVerification": "Awaiting verification",
  "platform.approvalNote":
    "Account approval and email verification are separate requirements. Approval does not bypass email verification.",

  "platform.verifyYourEmail": "Verify your email",
  "platform.resendVerificationEmail": "Resend verification email",
  "platform.refreshAccountStatus": "Refresh account status",

  "platform.stat.shops": "Shops",
  "platform.stat.pending": "Pending",
  "platform.stat.active": "Active",
  "platform.stat.suspended": "Suspended",

  "platform.filterStatus": "Filter status",
  "platform.allStatuses": "All statuses",
  "platform.refresh": "Refresh",
  "platform.noShops": "No shops found.",

  "platform.table.shopData": "Shop data",
  "platform.table.shop": "Shop",
  "platform.table.shopStatus": "Status",
  "platform.table.ownerEmail": "Owner email",
  "platform.table.businessDetails": "Business details",
  "platform.table.created": "Created",
  "platform.table.accountAccess": "Account access",
  "platform.table.timeUtc": "Time (UTC)",
  "platform.table.shopId": "Shop ID",
  "platform.table.actorId": "Actor ID",
  "platform.table.subject": "Subject",
  "platform.table.requestReference": "Request reference",
  "platform.platformLevel": "Platform",
  "platform.backgroundAction": "Background action",

  "platform.operationsTitle": "Platform operations",
  "platform.operationsSubtitle": "Processing status and activity references",
  "platform.refreshOperations": "Refresh operations",
  "platform.verifyForOperationsBefore": "Verify your email from",
  "platform.verifyForOperationsAfter": "to access operations.",
  "platform.noPermission":
    "You do not have permission to view platform operations.",
  "platform.loadingStatus": "Loading processing status…",

  "platform.database": "Database",
  "platform.checkedAt": "Checked {date}",
  "platform.queuedJobs": "Queued jobs ({driver})",
  "platform.notAvailable": "Not available",
  "platform.oldestSeconds": "Oldest: {seconds} seconds",
  "platform.noQueueAge": "No database queue age available",
  "platform.failedJobs": "Failed jobs",
  "platform.failedJobsHelp": "Review through controlled server operations.",
  "platform.fileScanner": "File scanner",
  "platform.configured": "Configured",
  "platform.notConfigured": "Not configured",
  "platform.scannerHelp":
    "Runtime and signature health not checked by this page.",

  "platform.documentsProcessing": "Document processing",
  "platform.productPhotos": "Product photos",
  "platform.customerImports": "Customer imports",
  "platform.noRecordsYet": "No records yet.",
  "platform.queueNotice":
    "Queue counts show pending work. Worker liveness and scanner signature freshness require the deployment monitoring checks.",

  "platform.activityAudit": "Activity audit",
  "platform.auditHelp":
    "Actor, shop and record references only. Use a request reference to locate an incident without exposing customer content.",
  "platform.filter.action": "Action contains",
  "platform.filter.shopId": "Shop ID",
  "platform.filter.from": "From date (UTC)",
  "platform.filter.to": "Through date (UTC)",
  "platform.filter.requestId": "Request reference",
  "platform.applyFilters": "Apply audit filters",
  "platform.clearFilters": "Clear filters",
  "platform.loadingAudit": "Loading audit…",
  "platform.noAuditEvents": "No matching audit events.",
  "platform.auditSummary": "{events} events · Page {page} of {total}",

  "platform.moduleNotFound": "Management page not found.",
  "platform.verifyForWorkspace":
    "Verify your Admin email in Account security to access shop management.",
  "platform.moduleForbidden":
    "Your Admin role does not have access to this module.",
  "platform.searchShopsToManage": "Search shops to manage",
  "platform.selectedShop": "Selected shop #{id}",
  "platform.managing": "Managing {name}",
  "platform.shopRef": "shop #{id}",
  "platform.actionsRecorded":
    "Every action is recorded against your Admin account.",
  "platform.readOnlyUntilActivated":
    "This shop is read-only until activated from Shop accounts.",

  "status.completed_with_errors": "completed with errors",

};

const it = {
  "platform.shopsTitle": "Account negozi",
  "platform.manageShop": "Gestisci negozio",
  "platform.reviewRegistration": "Esamina la registrazione",
  "platform.suspend": "Sospendi",
  "platform.activate": "Attiva",
  "platform.confirmActivate": "Attivare {name}?",
  "platform.confirmSuspend": "Sospendere {name}?",
  "platform.statusUpdated": "Stato del negozio aggiornato.",

  "platform.registrationDetails": "Dati di registrazione",
  "platform.detail.phone": "Telefono",
  "platform.detail.address": "Indirizzo",
  "platform.detail.city": "Città",
  "platform.detail.postalCode": "CAP",
  "platform.detail.country": "Paese",
  "platform.detail.timezone": "Fuso orario",
  "platform.notSuppliedExisting": "Non fornito (account esistente)",
  "platform.shopOwner": "Titolare del negozio",
  "platform.emailVerified": "Email verificata",
  "platform.emailVerificationPending": "Verifica dell'email in corso",
  "platform.verifiedBadge": "Verificata",
  "platform.awaitingVerification": "In attesa di verifica",
  "platform.approvalNote":
    "Approvazione dell'account e verifica dell'email sono requisiti distinti. L'approvazione non sostituisce la verifica dell'email.",

  "platform.verifyYourEmail": "Verifica la tua email",
  "platform.resendVerificationEmail": "Invia di nuovo l'email di verifica",
  "platform.refreshAccountStatus": "Aggiorna lo stato dell'account",

  "platform.stat.shops": "Negozi",
  "platform.stat.pending": "In attesa",
  "platform.stat.active": "Attivi",
  "platform.stat.suspended": "Sospesi",

  "platform.filterStatus": "Filtra per stato",
  "platform.allStatuses": "Tutti gli stati",
  "platform.refresh": "Aggiorna",
  "platform.noShops": "Nessun negozio trovato.",

  "platform.table.shopData": "Dati del negozio",
  "platform.table.shop": "Negozio",
  "platform.table.shopStatus": "Stato",
  "platform.table.ownerEmail": "Email del titolare",
  "platform.table.businessDetails": "Dati aziendali",
  "platform.table.created": "Creato",
  "platform.table.accountAccess": "Accesso all'account",
  "platform.table.timeUtc": "Ora (UTC)",
  "platform.table.shopId": "ID negozio",
  "platform.table.actorId": "ID operatore",
  "platform.table.subject": "Oggetto",
  "platform.table.requestReference": "Riferimento della richiesta",
  "platform.platformLevel": "Piattaforma",
  "platform.backgroundAction": "Azione in background",

  "platform.operationsTitle": "Operazioni di piattaforma",
  "platform.operationsSubtitle":
    "Stato delle elaborazioni e riferimenti di attività",
  "platform.refreshOperations": "Aggiorna le operazioni",
  "platform.verifyForOperationsBefore": "Verifica la tua email da",
  "platform.verifyForOperationsAfter": "per accedere alle operazioni.",
  "platform.noPermission":
    "Non hai il permesso di consultare le operazioni di piattaforma.",
  "platform.loadingStatus": "Caricamento dello stato delle elaborazioni…",

  "platform.database": "Database",
  "platform.checkedAt": "Verificato il {date}",
  "platform.queuedJobs": "Processi in coda ({driver})",
  "platform.notAvailable": "Non disponibile",
  "platform.oldestSeconds": "Il più vecchio: {seconds} secondi",
  "platform.noQueueAge":
    "Nessun dato disponibile sull'età della coda del database",
  "platform.failedJobs": "Processi non riusciti",
  "platform.failedJobsHelp":
    "Verifica tramite operazioni controllate sul server.",
  "platform.fileScanner": "Scanner dei file",
  "platform.configured": "Configurato",
  "platform.notConfigured": "Non configurato",
  "platform.scannerHelp":
    "Questa pagina non verifica lo stato del runtime e delle firme.",

  "platform.documentsProcessing": "Elaborazione documenti",
  "platform.productPhotos": "Foto dei prodotti",
  "platform.customerImports": "Importazioni clienti",
  "platform.noRecordsYet": "Ancora nessun record.",
  "platform.queueNotice":
    "I conteggi della coda mostrano il lavoro in sospeso. Lo stato dei worker e la freschezza delle firme dello scanner richiedono i controlli di monitoraggio del deployment.",

  "platform.activityAudit": "Registro delle attività",
  "platform.auditHelp":
    "Solo riferimenti di operatore, negozio e record. Usa un riferimento della richiesta per individuare un evento senza esporre i dati dei clienti.",
  "platform.filter.action": "L'azione contiene",
  "platform.filter.shopId": "ID negozio",
  "platform.filter.from": "Dalla data (UTC)",
  "platform.filter.to": "Fino alla data (UTC)",
  "platform.filter.requestId": "Riferimento della richiesta",
  "platform.applyFilters": "Applica i filtri del registro",
  "platform.clearFilters": "Azzera i filtri",
  "platform.loadingAudit": "Caricamento del registro…",
  "platform.noAuditEvents": "Nessun evento corrispondente.",
  "platform.auditSummary":
    "{events} eventi · Pagina {page} di {total}",

  "platform.moduleNotFound": "Pagina di gestione non trovata.",
  "platform.verifyForWorkspace":
    "Verifica la tua email Admin in Sicurezza dell'account per accedere alla gestione dei negozi.",
  "platform.moduleForbidden":
    "Il tuo ruolo Admin non ha accesso a questo modulo.",
  "platform.searchShopsToManage": "Cerca i negozi da gestire",
  "platform.selectedShop": "Negozio selezionato n. {id}",
  "platform.managing": "Gestione di {name}",
  "platform.shopRef": "negozio n. {id}",
  "platform.actionsRecorded":
    "Ogni azione viene registrata sull'account Admin.",
  "platform.readOnlyUntilActivated":
    "Questo negozio è in sola lettura finché non viene attivato da Account negozi.",

  "status.completed_with_errors": "completato con errori",

};

export default { en, it } satisfies LocaleModule;
