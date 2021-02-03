
let picker;

document.querySelectorAll('[data-date-picker]').forEach(datePicker => {
    picker = new DatePicker(datePicker)
})