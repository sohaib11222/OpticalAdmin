import type { LocaleModule } from "../types";

const en = {
  // Appointments
  "agenda.appointments": "Agenda",
  "agenda.newAppointment": "New appointment",
  "agenda.editAppointment": "Edit / reschedule appointment",
  "agenda.updateStatusTitle": "Update appointment status",
  "agenda.from": "From",
  "agenda.until": "Until (exclusive, up to 93 days)",
  "agenda.thAppointment": "Appointment",
  "agenda.thLocalTime": "Shop local time",
  "agenda.thCustomer": "Customer / links",
  "agenda.thStatus": "Status",
  "agenda.thActions": "Actions",
  "agenda.history": "History",
  "agenda.editReschedule": "Edit / reschedule",
  "agenda.completeCancel": "Complete / cancel",
  "agenda.orderRef": "order #{id}",
  "agenda.opticalRef": "optical #{id}",
  "agenda.customer": "Customer",
  "agenda.overlapConfirm":
    "I reviewed the overlap warning and confirm the overlapping appointment",
  "agenda.clockChangeLabel":
    "When a time occurs twice during a clock change ({zone})",
  "agenda.clockChangeOccurrence": "Clock-change occurrence",
  "agenda.foldAsk": "Ask me before saving",
  "agenda.foldEarlier": "Earlier occurrence",
  "agenda.foldLater": "Later occurrence",
  "agenda.fieldTitle": "Title",
  "agenda.fieldStarts": "Starts (shop time)",
  "agenda.fieldEnds": "Ends (shop time)",
  "agenda.fieldOrderId": "Order ID (same customer)",
  "agenda.fieldOpticalRecordId": "Clinical record ID (same customer)",
  "agenda.fieldNotes": "Notes",
  "agenda.fieldChangeReason": "Change reason",
  "agenda.fieldReason": "Reason",
  "agenda.fieldStatus": "Status",
  "agenda.timeUnavailable":
    "This local time does not exist because clocks change. Choose another time.",
  "agenda.timeAmbiguous":
    "This time occurs twice. Select the earlier or later clock occurrence.",

  // Shop administration
  "agenda.shopSettingsTitle": "Shop settings",
  "agenda.editSettings": "Edit settings",
  "agenda.membershipsTitle": "Shop memberships",
  "agenda.thName": "Name",
  "agenda.thEmail": "Email",
  "agenda.thRole": "Role",
  "agenda.currencyLocked":
    "Currency is locked after catalog prices exist; historical amounts cannot be reinterpreted.",
  "agenda.notificationsTitle": "Operational notifications",
  "agenda.prefStock": "stock",
  "agenda.prefOrders": "orders",
  "agenda.prefImports": "imports",
  "agenda.prefAgenda": "agenda",
  "agenda.fieldShopName": "Shop name",
  "agenda.fieldPhone": "Business phone",
  "agenda.fieldAddressLine1": "Street address",
  "agenda.fieldAddressLine2": "Address line 2",
  "agenda.fieldCity": "City",
  "agenda.fieldPostalCode": "Postal code / CAP",
  "agenda.fieldCountry": "Country",
  "agenda.fieldTimezone": "IANA time zone",
  "agenda.helpTimezone": "For example Europe/Rome or Europe/Berlin.",
  "agenda.fieldCurrency": "Currency",
  "agenda.fieldStockLocation": "Stock location name",

  // Shared status labels (Appointment.status)
  "status.scheduled": "scheduled",
  "status.no_show": "no show",

  // Shared API field labels used by errorMessage()
};

const it = {
  // Appuntamenti
  "agenda.appointments": "Agenda",
  "agenda.newAppointment": "Nuovo appuntamento",
  "agenda.editAppointment": "Modifica / riprogramma appuntamento",
  "agenda.updateStatusTitle": "Aggiorna lo stato dell'appuntamento",
  "agenda.from": "Dal",
  "agenda.until": "Fino a (escluso, fino a 93 giorni)",
  "agenda.thAppointment": "Appuntamento",
  "agenda.thLocalTime": "Orario locale del negozio",
  "agenda.thCustomer": "Cliente / collegamenti",
  "agenda.thStatus": "Stato",
  "agenda.thActions": "Azioni",
  "agenda.history": "Cronologia",
  "agenda.editReschedule": "Modifica / riprogramma",
  "agenda.completeCancel": "Completa / annulla",
  "agenda.orderRef": "ordine n. {id}",
  "agenda.opticalRef": "record ottico n. {id}",
  "agenda.customer": "Cliente",
  "agenda.overlapConfirm":
    "Ho verificato l'avviso di sovrapposizione e confermo l'appuntamento sovrapposto",
  "agenda.clockChangeLabel":
    "Quando un orario si ripete durante un cambio d'ora ({zone})",
  "agenda.clockChangeOccurrence": "Occorrenza del cambio d'ora",
  "agenda.foldAsk": "Chiedi prima di salvare",
  "agenda.foldEarlier": "Prima occorrenza",
  "agenda.foldLater": "Seconda occorrenza",
  "agenda.fieldTitle": "Titolo",
  "agenda.fieldStarts": "Inizio (ora del negozio)",
  "agenda.fieldEnds": "Fine (ora del negozio)",
  "agenda.fieldOrderId": "ID ordine (stesso cliente)",
  "agenda.fieldOpticalRecordId": "ID record clinico (stesso cliente)",
  "agenda.fieldNotes": "Note",
  "agenda.fieldChangeReason": "Motivo della modifica",
  "agenda.fieldReason": "Motivo",
  "agenda.fieldStatus": "Stato",
  "agenda.timeUnavailable":
    "Questo orario locale non esiste perché cambiano gli orologi. Scegline un altro.",
  "agenda.timeAmbiguous":
    "Questo orario si verifica due volte. Seleziona la prima o la seconda occorrenza.",

  // Amministrazione del negozio
  "agenda.shopSettingsTitle": "Impostazioni del negozio",
  "agenda.editSettings": "Modifica impostazioni",
  "agenda.membershipsTitle": "Membri del negozio",
  "agenda.thName": "Nome",
  "agenda.thEmail": "Email",
  "agenda.thRole": "Ruolo",
  "agenda.currencyLocked":
    "La valuta è bloccata quando esistono prezzi in catalogo; gli importi storici non possono essere reinterpretati.",
  "agenda.notificationsTitle": "Notifiche operative",
  "agenda.prefStock": "magazzino",
  "agenda.prefOrders": "ordini",
  "agenda.prefImports": "importazioni",
  "agenda.prefAgenda": "appuntamenti",
  "agenda.fieldShopName": "Nome del negozio",
  "agenda.fieldPhone": "Telefono",
  "agenda.fieldAddressLine1": "Indirizzo",
  "agenda.fieldAddressLine2": "Indirizzo, riga 2",
  "agenda.fieldCity": "Città",
  "agenda.fieldPostalCode": "CAP",
  "agenda.fieldCountry": "Paese",
  "agenda.fieldTimezone": "Fuso orario IANA",
  "agenda.helpTimezone": "Ad esempio Europe/Rome o Europe/Berlin.",
  "agenda.fieldCurrency": "Valuta",
  "agenda.fieldStockLocation": "Nome del punto di magazzino",

  // Etichette di stato condivise (Appointment.status)
  "status.scheduled": "programmato",
  "status.no_show": "non presentato",

  // Etichette condivise dei campi API usate da errorMessage()
};

export default { en, it } satisfies LocaleModule;