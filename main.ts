namespace Lopende_Band {

    //% group="Motor"
    //% block="Motor vooruit draaien"
    export function vooruit() {
        pins.digitalWritePin(DigitalPin.P0, 1)
        pins.digitalWritePin(DigitalPin.P14, 0)
    }

    //% group="Motor"
    //% block="Motor achteruit draaien"
    export function achteruit() {
        pins.digitalWritePin(DigitalPin.P0, 0)
        pins.digitalWritePin(DigitalPin.P14, 1)
    }

    //% group="Motor"
    //% block="Motor stoppen"
    export function stop() {
        pins.digitalWritePin(DigitalPin.P0, 0)
        pins.digitalWritePin(DigitalPin.P14, 0)
    }

    //% group="Kleurdetectie"
    //% block="Toon kleur op scherm"
    export function toonKleur() {
        const kleur = bepaalKleur()
        const teken = kleur == "rood" ? "R" :
                      kleur == "groen" ? "G" :
                      kleur == "blauw" ? "B" :
                      kleur == "geel" ? "Y" : "X"
        basic.showString(teken)
    }

    //% group="Kleurdetectie"
    //% block="Kleur is %kleur"
    //% kleur.shadow="colorDropdown"
    export function kleurIs(kleur: string): boolean {
        return bepaalKleur() == kleur
    }

    //% blockId=colorDropdown block="%kleur"
    //% blockHidden=true
    export function colorDropdown(kleur: string): string {
        return kleur
    }

    function bepaalKleur(): string {
        initTCS()
        let r = leesKleur(0x16)
        let g = leesKleur(0x18)
        let b = leesKleur(0x1A)

        serial.writeLine(`R:${r} G:${g} B:${b}`)

        if (r > g * 1.2 && r > b * 1.2) return "rood"
        if (g > r * 1.2 && g > b * 1.2) return "groen"
        if (b > r * 1.2 && b > g * 1.2) return "blauw"
        if (r > 100 && g > 100 && b < r * 0.6 && b < g * 0.6) return "geel"
        return "onbekend"
    }

    let isInit = false
    function initTCS() {
        if (isInit) return
        const addr = 0x29
        pins.i2cWriteBuffer(addr, pins.createBufferFromArray([0x80 | 0x00, 0x01]))
        basic.pause(10)
        pins.i2cWriteBuffer(addr, pins.createBufferFromArray([0x80 | 0x00, 0x03]))
        isInit = true
    }

    function leesKleur(reg: number): number {
        const addr = 0x29
        pins.i2cWriteNumber(addr, 0x80 | reg, NumberFormat.UInt8BE)
        return pins.i2cReadNumber(addr, NumberFormat.UInt16LE)
    }
}