interface Month{
    name: string,
    days: number
}

class DatePicker{
    private static baseClass = "__fgc_date-picker"

    private static dayNames = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"]
    private static months: Month[] = [
        {
            name: "Gennaio",
            days: 31
        },
        {
            name: "Febbraio",
            days: 28
        },
        {
            name: "Marzo",
            days: 31
        },
        {
            name: "Aprile",
            days: 30
        },
        {
            name: "Maggio",
            days: 31
        },
        {
            name: "Giugno",
            days: 30
        },
        {
            name: "Luglio",
            days: 31
        },
        {
            name: "Agosto",
            days: 31
        },
        {
            name: "Settembre",
            days: 30
        },
        {
            name: "Ottobre",
            days: 31
        },
        {
            name: "Novembre",
            days: 30
        },
        {
            name: "Dicemebre",
            days: 31
        },
    ]

    private originalElement: HTMLInputElement
    private readonly rootElement: HTMLElement
    private readonly input: HTMLElement
    private readonly inputBtn: HTMLImageElement
    private readonly inputLabel: HTMLElement
    private readonly calendarFrame: HTMLElement
    private readonly calendarsContainer: HTMLElement
    private readonly navBar: HTMLElement
    private readonly navLabel: HTMLElement
    private readonly navLabelYear: HTMLElement
    private readonly navLabelMonth: HTMLElement
    private readonly navLeftBtn: HTMLElement
    private readonly navRightBtn: HTMLElement
    private selectedCell: HTMLElement

    private calendars: HTMLElement[] = []
    private currentDate: Date

    private animating: boolean = false
    private touchStartPos: {x: number, y: number}
    private dragStartTime: number

    private _minValue: Date = new Date('0001-01-01')
    set minValue(minValue: Date | string){
        if(minValue instanceof Date) this._minValue = minValue
        else this._minValue = new Date(minValue)

        if(typeof (this._value) !== 'undefined' && this._value.getTime() < this._minValue.getTime()){
            this._value = new Date(this._minValue.getTime())
        }

        this.createCalendars()
    }

    private _value: Date
    get value(): Date{
        return this._value
    }
    set value(value: Date){
        if(value.getTime() >= this._minValue.getTime()){
            this._value = value
        }
        else {
            this._value = new Date(this._minValue.getTime())
        }

        this.createCalendars()
    }

    public dateFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
    public dateTimeFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(navigator.language || 'it-IT', this.dateFormatOptions)

    constructor(element: HTMLInputElement) {

        this.originalElement = element
        this.rootElement = document.createElement('div')
        this.input = document.createElement('div')
        this.inputBtn = document.createElement('img')
        this.inputLabel = document.createElement('span')
        this.calendarFrame = document.createElement('div')
        this.calendarsContainer = document.createElement('div')
        this.navBar = document.createElement('div')
        this.navLabel = document.createElement('div')
        this.navLabelYear = document.createElement('span')
        this.navLabelMonth = document.createElement('span')
        this.navLeftBtn = document.createElement('div')
        this.navRightBtn = document.createElement('div')

        this.setup()
    }

    private setup(){

        this.originalElement.type = 'hidden'
        this.originalElement.after(this.rootElement)

        let buttonArrow = document.createElement('div')
        let arrowPart = document.createElement('div')

        this.rootElement.classList.add(DatePicker.baseClass)
        this.input.classList.add(DatePicker.baseClass+"__input")
        this.inputBtn.classList.add(DatePicker.baseClass+"__input-btn")
        this.inputLabel.classList.add(DatePicker.baseClass+"__input-label")
        this.calendarFrame.classList.add(DatePicker.baseClass+"__frame")
        this.calendarsContainer.classList.add(DatePicker.baseClass+"__container")
        this.navBar.classList.add(DatePicker.baseClass+"__nav")
        this.navLabel.classList.add(DatePicker.baseClass+"__nav-label")
        this.navLabelYear.classList.add(DatePicker.baseClass+"__nav-year")
        this.navLabelMonth.classList.add(DatePicker.baseClass+"__nav-month")
        this.navLeftBtn.classList.add(DatePicker.baseClass+"__nav-btn", DatePicker.baseClass+"__nav-btn--left")
        this.navRightBtn.classList.add(DatePicker.baseClass+"__nav-btn", DatePicker.baseClass+"__nav-btn--right")
        buttonArrow.classList.add(DatePicker.baseClass+"__nav-btn-arrow")
        arrowPart.classList.add(DatePicker.baseClass+"__nav-btn-arrow-part")

        this.rootElement.append(this.input)
        this.rootElement.append(this.calendarFrame)
        this.calendarFrame.append(this.navBar)
        this.calendarFrame.append(this.calendarsContainer)
        this.input.append(this.inputLabel)
        this.input.append(this.inputBtn)
        this.navBar.append(this.navLeftBtn)
        this.navBar.append(this.navLabel)
        this.navBar.append(this.navRightBtn)
        this.navLabel.append(this.navLabelYear)
        this.navLabel.append(this.navLabelMonth)

        buttonArrow.append(arrowPart.cloneNode(true))
        buttonArrow.append(arrowPart.cloneNode(true))
        this.navRightBtn.append(buttonArrow.cloneNode(true))
        this.navLeftBtn.append(buttonArrow.cloneNode(true))

        this.navRightBtn.addEventListener('click', () => {
            this.showNextCalendar()
        })
        this.navLeftBtn.addEventListener('click', () => {
            this.showPrevCalendar()
        })

        this.calendarsContainer.addEventListener('touchstart', this.dragStart.bind(this))
        this.calendarsContainer.addEventListener('touchmove', this.dragHandler.bind(this))
        this.calendarsContainer.addEventListener('touchend', this.dragEnd.bind(this))

        this.calendarFrame.tabIndex = 0
        this.input.tabIndex = 0
        this.inputBtn.src = "img/calendar_today-24px.svg"
        this.inputBtn.addEventListener('click', () => {
            this.calendarFrame.classList.add(DatePicker.baseClass+"__frame--show")
            this.calendarFrame.focus()
        })
        this.inputLabel.innerText = "Seleziona una data"

        this.calendarFrame.addEventListener('blur', () => {
            this.calendarFrame.classList.remove(DatePicker.baseClass+"__frame--show")
        })


        if(this.originalElement.hasAttribute('value')){
            this._value = new Date(this.originalElement.getAttribute('value'))
            this.inputLabel.innerText = this.dateTimeFormat.format(this._value)
        }

        this.currentDate = this._value || new Date()

        if(this.originalElement.hasAttribute('min')){
            this.minValue = this.originalElement.getAttribute('min')
        }
        else{
            this.createCalendars()
        }

        this.navLabelYear.innerText = this.currentDate.getFullYear().toString(10)
        this.navLabelMonth.innerText = DatePicker.months[this.currentDate.getMonth()].name
    }

    private createCalendars(){
        this.calendars.forEach(calendar => calendar.remove())
        this.calendars = []
        this.calendars.push(this.createPreviousMonthCalendar())
        this.calendars.push(this.createCalendar(this.currentDate))
        this.calendars.push(this.createNextMonthCalendar())
    }

    private showNextCalendar(){

        //if(this.animating) return
        this.animating = true

        let nextCalendarPos = parseFloat(this.calendars[2].style.left)

        let startTime = -1
        let startProgress = 1 - (nextCalendarPos/100)
        let duration = 300 //- 200*startProgress

        let self = this

        let nextDate = self.nextMonth()
        self.navLabelYear.innerText = nextDate.getFullYear().toString(10)
        self.navLabelMonth.innerText = DatePicker.months[nextDate.getMonth()].name

        function step(time){
            if(startTime < 0)startTime = time
            let progress = DatePicker.clamp((time - startTime)/duration + startProgress, 0, 1)

            self.calendars[1].style.left = `${-progress*100}%`
            self.calendars[2].style.left = `${100-progress*100}%`

            if(progress < 1) window.requestAnimationFrame(step)
            else {
                self.currentDate = nextDate
                self.calendars[0].remove()
                self.calendars[0] = self.calendars[1]
                self.calendars[1] = self.calendars[2]
                self.calendars[2] = self.createNextMonthCalendar()

                //self.navLabelYear.innerText = self.currentDate.getFullYear().toString(10)
                //self.navLabelMonth.innerText = DatePicker.months[self.currentDate.getMonth()].name
                self.animating = false
            }
        }

        window.requestAnimationFrame(step)
    }

    private showPrevCalendar(){

        //if(this.animating) return
        this.animating = true

        let currCalendarPos = parseFloat(this.calendars[1].style.left)

        let startTime = -1
        let startProgress = currCalendarPos/100
        let duration = 300 //- 200*startProgress

        let self = this

        function step(time){
            if(startTime < 0)startTime = time
            let progress = DatePicker.clamp((time - startTime)/duration + startProgress, 0, 1)

            self.calendars[0].style.left = `${-100+progress*100}%`
            self.calendars[1].style.left = `${progress*100}%`

            if(progress < 1) window.requestAnimationFrame(step)
            else {
                self.currentDate = self.previousMonth()
                self.calendars[2].remove()
                self.calendars[2] = self.calendars[1]
                self.calendars[1] = self.calendars[0]
                self.calendars[0] = self.createPreviousMonthCalendar()

                self.navLabelYear.innerText = self.currentDate.getFullYear().toString(10)
                self.navLabelMonth.innerText = DatePicker.months[self.currentDate.getMonth()].name
                self.animating = false
            }
        }

        window.requestAnimationFrame(step)
    }

    private static clamp(value: number, min: number, max: number): number{
        return Math.max(Math.min(value, max), min);
    }

    private createNextMonthCalendar(): HTMLElement{
        let nextCalendar = this.createCalendar(this.nextMonth())
        nextCalendar.style.left = '100%'
        return nextCalendar
    }

    private createPreviousMonthCalendar(): HTMLElement{
        let prevCalendar = this.createCalendar(this.previousMonth())
        prevCalendar.style.left = '-100%'
        return prevCalendar
    }

    private createCalendar(date: Date): HTMLElement {

        let calendarGrid = document.createElement('div')
        calendarGrid.style.left = '0'
        calendarGrid.classList.add(DatePicker.baseClass+"__grid")

        for(let i = 0; i < 7; i++){
            let cell = document.createElement('div')
            cell.classList.add(DatePicker.baseClass+"__header-cell")
            cell.innerText = DatePicker.dayNames[i]
            calendarGrid.append(cell)
        }

        let month = date.getMonth()
        let year = date.getFullYear()

        let prevMonth = month - 1
        if(prevMonth < 0) prevMonth = 11

        let monthStr = month < 9 ? `0${month+1}` : (month+1).toString(10)
        let firstDayDate = new Date(`${year}-${monthStr}-01`)
        let firstDay = firstDayDate.getDay()

        firstDay = firstDay === 0 ? 6 : firstDay-1

        let currentMothDays = DatePicker.months[month].days

        if(month === 1 && DatePicker.isLeapYear(year)) currentMothDays++

        for(let i = 0; i < 42; i++){
            let cell = document.createElement('div')
            let cellContent = document.createElement('div')
            cell.classList.add(DatePicker.baseClass+"__cell")
            cellContent.classList.add(DatePicker.baseClass+"__cell__content")
            cell.append(cellContent)
            calendarGrid.append(cell)

            if(i < firstDay){
                cellContent.innerText = `${DatePicker.months[prevMonth].days-(firstDay-i-1)}`
                cell.classList.add(DatePicker.baseClass+"__cell--disabled")
            }
            else if(i < currentMothDays+firstDay){
                let day = i-firstDay+1
                cellContent.innerText = day.toString()

                let date = new Date(DatePicker.createDateString(year, month, day))

                if(typeof (this._minValue) !== 'undefined' && date.getTime() < this._minValue.getTime()){
                    cell.classList.add(DatePicker.baseClass+"__cell--disabled")
                    continue
                }

                if(typeof (this._value) !== 'undefined' && this._value.getTime() === date.getTime()){
                    this.selectCell(cell)
                }

                cellContent.addEventListener('click', () => {
                    this.selectCell(cell)
                    this.pickDate.bind(this)(year, month, day)
                })

            }
            else{
                cellContent.innerText = `${i-(currentMothDays + firstDay)+1}`
                cell.classList.add(DatePicker.baseClass+"__cell--disabled")
            }
        }

        this.calendarsContainer.append(calendarGrid)
        return calendarGrid
    }

    private selectCell(cell: HTMLElement){
        if(typeof(this.selectedCell) !== 'undefined')
            this.selectedCell.classList.remove(DatePicker.baseClass+"__cell--selected")
        this.selectedCell = cell
        this.selectedCell.classList.add(DatePicker.baseClass+"__cell--selected")
    }

    private static isLeapYear(year: number): boolean {
        return (year % 4 === 0) && (year % 100 !== 0 || year % 400 === 0)
    }

    private nextMonth(): Date{
        let month = this.currentDate.getMonth() + 1
        let year = this.currentDate.getFullYear()
        if(month > 11) {
            month = 0
            year++
        }

        return new Date(DatePicker.createDateString(year, month, 1))
    }

    private previousMonth(): Date{
        let month = this.currentDate.getMonth() - 1
        let year = this.currentDate.getFullYear()
        if(month < 0){
            if(year > 1){
                month = 11
                year--
            }
            else{
                month = 0
            }
        }

        return new Date(DatePicker.createDateString(year, month, 1))
    }

    private static createDateString(year: number, month: number, day: number): string{
        day = Math.max(1, day)
        month = Math.max(0, Math.min(11, month))
        year = Math.max(1, year)

        let monthStr = month < 9 ? `0${month+1}` : (month+1).toString(10)
        let dayStr = day < 10 ? `0${day}` : day.toString(10)
        let yearStr = year.toString(10)

        if(year < 10){
            yearStr = `000${yearStr}`
        }
        else if(year < 100){
            yearStr = `00${yearStr}`
        }
        else if(year < 1000){
            yearStr = `0${yearStr}`
        }

        return `${yearStr}-${monthStr}-${dayStr}`
    }

    private dragHandler(e: TouchEvent){
        e.preventDefault()

        let delta = {
            x: e.changedTouches[0].pageX - this.touchStartPos.x,
            y: e.changedTouches[0].pageY - this.touchStartPos.y
        }

        let percentage = (delta.x/this.calendarsContainer.clientWidth)*100
        if(delta.x < 0){
            this.calendars[1].style.left = `${percentage}%`
            this.calendars[2].style.left = `${100+percentage}%`
        }
        else{
            this.calendars[1].style.left = `${percentage}%`
            this.calendars[0].style.left = `${-100+percentage}%`
        }

    }

    private dragStart(e: TouchEvent){
        //e.preventDefault()
        this.touchStartPos = {
            x: e.changedTouches[0].pageX,
            y: e.changedTouches[0].pageY
        }

        this.dragStartTime = performance.now()
    }

    private dragEnd(e: TouchEvent){

        let x = e.changedTouches[0].pageX
        let y = e.changedTouches[0].pageY

        let delta = {
            x: x - this.touchStartPos.x,
            y: y - this.touchStartPos.y
        }

        let deltaTime = performance.now() - this.dragStartTime

        if (Math.abs(parseInt(this.calendars[1].style.left)) >= 50 || Math.abs(delta.x) > 60 && deltaTime < 210){
            delta.x > 0 ? this.showPrevCalendar() : this.showNextCalendar()
        }
        else if(parseFloat(this.calendars[1].style.left) !== 0){
            this.adjustPosition()
        }
    }

    private adjustPosition(){

        let currentPos = parseFloat(this.calendars[1].style.left)

        let duration = 300
        let startTime = -1
        let self = this

        function step(time){
            if(startTime < 0) startTime = time
            const progress = DatePicker.clamp((time - startTime) / duration, 0, 1)

            if(currentPos > 0){
                let pos = currentPos * (1 - progress)
                self.calendars[1].style.left = `${pos}%`
                self.calendars[0].style.left = `${pos-100}%`
            }
            else{
                let pos = -currentPos * progress + currentPos
                self.calendars[1].style.left = `${pos}%`
                self.calendars[2].style.left = `${100+pos}%`
            }

            if(progress < 1) window.requestAnimationFrame(step)
        }

        window.requestAnimationFrame(step)
    }


    private pickDate(year: number, month: number, day: number){

        let dateStr = DatePicker.createDateString(year, month, day)

        this.originalElement.setAttribute('value', dateStr)
        this._value = new Date(dateStr)
        this.inputLabel.innerText = this.dateTimeFormat.format(this._value)
        this.calendarFrame.blur()
    }

}