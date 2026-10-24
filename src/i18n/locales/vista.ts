import type { LocaleModule } from "../types";

const en = {
  // Connection panel
  "vista.connectionTitle": "Vista Express connection",
  "vista.notConfigured":
    "Vista integration is not configured. Standalone shop workflows remain available.",
  "vista.vistaStore": "Vista store #{id}",
  "vista.autoSync":
    "Automatic synchronization runs about every two minutes. Last synchronized: {when} · Expires: {expiry}",
  "vista.never": "Never",
  "vista.syncData": "Synchronize Vista data",
  "vista.disconnect": "Disconnect",
  "vista.disconnectConfirm":
    "Disconnect this shop from Vista Express? Pending publications must be resolved first.",
  "vista.authorizeOwner":
    "The shop owner must authorize their seller account from Vista Express 360 → Vista Express. An administrator cannot enter or impersonate the seller's password.",
  "vista.sourceIdentity":
    "Vista records keep their source identity. Remote orders do not post local sales. Publication transfers only the chosen quantity and preserves independent local stock.",

  // Records panel
  "vista.recordsTitle": "Vista Express records",
  "vista.kind.products": "Products",
  "vista.kind.orders": "Orders",
  "vista.kind.customers": "Customers",
  "vista.searchRecords": "Search Vista records",
  "vista.colVistaId": "Vista ID",
  "vista.actions": "Actions",
  "vista.details": "Details",
  "vista.reviewCustomerImport": "Review customer import",
  "vista.previewCreated": "Preview #{id} created.",
  "vista.openImports": "Open {label}",
  "vista.reviewDuplicatesHint": ", review duplicates and commit the batch.",

  // Customer import review
  "vista.reviewTitle": "Review Vista customer identity",
  "vista.firstName": "First name",
  "vista.lastName": "Last name",
  "vista.reviewHelp":
    "Vista name: {name}. Confirm the name fields; contacts are never automatically merged.",

  // Record detail
  "vista.viewTitle": "Vista {kind} #{remoteId}",
  "vista.observedAt": "Observed {when}",

  // Publication panel
  "vista.publicationTitle": "Vista Express publication",
  "vista.connectFirst": "The owner must connect a Vista seller account first.",
  "vista.publishedProduct": "Vista product #{id}",
  "vista.notPublished": "Not published",
  "vista.visible": "Visible",
  "vista.notVisible": "Not visible",
  "vista.availableStock":
    "Available shop stock {available}. A chosen allocation is reserved, then deducted when Vista accepts it.",
  "vista.schemaVersion": "Deploy the Vista category-form update before publishing.",
  "vista.updateOrAllocate": "Update Vista Express / allocate stock",
  "vista.uploadToVista": "Upload to Vista Express",
  "vista.refreshPublication": "Refresh Vista publication",
  "vista.thOperation": "Operation",
  "vista.thStatus": "Status",
  "vista.thAllocated": "Allocated / attempts",
  "vista.thResult": "Result / actions",
  "vista.retry": "Retry same publication",
  "vista.cancelPublication": "Cancel pending publication",
  "vista.cancelConfirm":
    "Ask Vista to cancel this unaccepted publication and release the reservation?",

  // Publication dialog
  "vista.publishTitle": "Publish to Vista Express",
  "vista.photoOrderNote":
    "Select main, color and pack photographs separately from the clean product photos. Option quantities are additional stock allocations.",
  "vista.categoryLabel": "Vista category",
  "vista.selectPlaceholder": "Select",
  "vista.productType": "Vista product type: {type}",
  "vista.subcategoryLabel": "Vista subcategory",
  "vista.quantityLabel": "Quantity to allocate now",
  "vista.optionAllocationTotal":
    "Option allocation total: {total}. Must equal quantity to allocate now ({quantity}).",
  "vista.publishBtn": "Publish with chosen allocation",

  // Dynamic Vista field definitions
  "vista.removeOption": "Remove {label} {index}",
  "vista.addOption": "Add {label}",

  // Column headers and record payload keys
  "vista.field.id": "ID",
  "vista.field.name": "Name",
  "vista.field.sku": "SKU",
  "vista.field.price": "Price",
  "vista.field.currency": "Currency",
  "vista.field.stock_quantity": "Stock quantity",
  "vista.field.stock_status": "Stock status",
  "vista.field.visible": "Visible",
  "vista.field.order_number": "Order number",
  "vista.field.customer_id": "Customer",
  "vista.field.status": "Status",
  "vista.field.subtotal": "Subtotal",
  "vista.field.delivery_fee": "Delivery fee",
  "vista.field.total": "Total",
  "vista.field.email": "Email",
  "vista.field.phone": "Phone",
  "vista.field.description": "Description",
  "vista.field.brand": "Brand",
  "vista.field.model": "Model",
  "vista.field.color": "Colour",
  "vista.field.is_active": "Active",
  "vista.field.created_at": "Created",
  "vista.field.updated_at": "Updated",
  "vista.field.observed_at": "Observed",

  // Shared API status values not declared elsewhere
  "status.syncing": "syncing",
  "status.uncertain": "uncertain",

  // Shared API validation field labels
};

const it = {
  // Pannello connessione
  "vista.connectionTitle": "Connessione Vista Express",
  "vista.notConfigured":
    "L'integrazione Vista non è configurata. I flussi di lavoro autonomi del negozio restano disponibili.",
  "vista.vistaStore": "Negozio Vista n. {id}",
  "vista.autoSync":
    "La sincronizzazione automatica viene eseguita ogni due minuti circa. Ultima sincronizzazione: {when} · Scadenza: {expiry}",
  "vista.never": "Mai",
  "vista.syncData": "Sincronizza i dati Vista",
  "vista.disconnect": "Disconnetti",
  "vista.disconnectConfirm":
    "Disconnettere questo negozio da Vista Express? Le pubblicazioni in sospeso devono prima essere risolte.",
  "vista.authorizeOwner":
    "Il proprietario del negozio deve autorizzare il proprio account venditore da Vista Express 360 → Vista Express. Un amministratore non può inserire né usare la password del venditore.",
  "vista.sourceIdentity":
    "I record Vista conservano la propria identità di origine. Gli ordini remoti non registrano vendite locali. La pubblicazione trasferisce solo la quantità scelta e mantiene indipendente la giacenza locale.",

  // Pannello record
  "vista.recordsTitle": "Record Vista Express",
  "vista.kind.products": "Prodotti",
  "vista.kind.orders": "Ordini",
  "vista.kind.customers": "Clienti",
  "vista.searchRecords": "Cerca tra i record Vista",
  "vista.colVistaId": "ID Vista",
  "vista.actions": "Azioni",
  "vista.details": "Dettagli",
  "vista.reviewCustomerImport": "Revisiona importazione cliente",
  "vista.previewCreated": "Anteprima n. {id} creata.",
  "vista.openImports": "Apri {label}",
  "vista.reviewDuplicatesHint": ", controlla i duplicati e conferma il lotto.",

  // Revisione importazione cliente
  "vista.reviewTitle": "Revisiona l'identità del cliente Vista",
  "vista.firstName": "Nome",
  "vista.lastName": "Cognome",
  "vista.reviewHelp":
    "Nome Vista: {name}. Conferma i campi del nome; i contatti non vengono mai uniti automaticamente.",

  // Dettaglio record
  "vista.viewTitle": "Vista {kind} n. {remoteId}",
  "vista.observedAt": "Rilevato il {when}",

  // Pannello pubblicazione
  "vista.publicationTitle": "Pubblicazione su Vista Express",
  "vista.connectFirst": "Il proprietario deve prima collegare un account venditore Vista.",
  "vista.publishedProduct": "Prodotto Vista n. {id}",
  "vista.notPublished": "Non pubblicato",
  "vista.visible": "Visibile",
  "vista.notVisible": "Non visibile",
  "vista.availableStock":
    "Scorte disponibili in negozio: {available}. L'allocazione scelta viene riservata e poi scalata quando Vista la accetta.",
  "vista.schemaVersion":
    "Pubblica sul server l'aggiornamento del modulo categorie di Vista prima di procedere.",
  "vista.updateOrAllocate": "Aggiorna Vista Express / alloca scorte",
  "vista.uploadToVista": "Carica su Vista Express",
  "vista.refreshPublication": "Aggiorna la pubblicazione Vista",
  "vista.thOperation": "Operazione",
  "vista.thStatus": "Stato",
  "vista.thAllocated": "Allocati / tentativi",
  "vista.thResult": "Esito / azioni",
  "vista.retry": "Riprova la stessa pubblicazione",
  "vista.cancelPublication": "Annulla la pubblicazione in sospeso",
  "vista.cancelConfirm":
    "Chiedere a Vista di annullare questa pubblicazione non ancora accettata e di rilasciare la riserva?",

  // Finestra di pubblicazione
  "vista.publishTitle": "Pubblica su Vista Express",
  "vista.photoOrderNote":
    "Le foto verificate del prodotto mantengono il loro ordine attuale. Le quantità delle opzioni sono allocazioni aggiuntive di giacenza.",
  "vista.categoryLabel": "Categoria Vista",
  "vista.selectPlaceholder": "Seleziona",
  "vista.productType": "Tipo di prodotto Vista: {type}",
  "vista.subcategoryLabel": "Sottocategoria Vista",
  "vista.quantityLabel": "Quantità da allocare adesso",
  "vista.optionAllocationTotal":
    "Totale allocato tra le opzioni: {total}. Deve essere uguale alla quantità da allocare adesso ({quantity}).",
  "vista.publishBtn": "Pubblica con l'allocazione scelta",

  // Definizioni di campo Vista dinamiche
  "vista.removeOption": "Rimuovi {label} {index}",
  "vista.addOption": "Aggiungi {label}",

  // Intestazioni di colonna e chiavi del payload del record
  "vista.field.id": "ID",
  "vista.field.name": "Nome",
  "vista.field.sku": "SKU",
  "vista.field.price": "Prezzo",
  "vista.field.currency": "Valuta",
  "vista.field.stock_quantity": "Quantità in giacenza",
  "vista.field.stock_status": "Stato della giacenza",
  "vista.field.visible": "Visibile",
  "vista.field.order_number": "Numero d'ordine",
  "vista.field.customer_id": "Cliente",
  "vista.field.status": "Stato",
  "vista.field.subtotal": "Subtotale",
  "vista.field.delivery_fee": "Costo di consegna",
  "vista.field.total": "Totale",
  "vista.field.email": "Email",
  "vista.field.phone": "Telefono",
  "vista.field.description": "Descrizione",
  "vista.field.brand": "Marchio",
  "vista.field.model": "Modello",
  "vista.field.color": "Colore",
  "vista.field.is_active": "Attivo",
  "vista.field.created_at": "Creato",
  "vista.field.updated_at": "Aggiornato",
  "vista.field.observed_at": "Rilevato",

  // Stati API condivisi non dichiarati altrove
  "status.syncing": "in sincronizzazione",
  "status.uncertain": "incerto",

  // Etichette condivise dei campi di validazione API
};

export default { en, it } satisfies LocaleModule;