// === AFSTANDSSENSOR (VL6180X TOF050C) ===

let vl6180xGeinitialiseerd = false

function initVL6180X() {
    const addr = 0x29
    // Check ID register
    pins.i2cWriteNumber(addr, 0x00, NumberFormat.UInt8BE)
    const id = pins.i2cReadNumber(addr, NumberFormat.UInt8BE)
    if (id != 0xB4) {
        serial.writeLine("TOF sensor niet gevonden (ID: " + id + ")")
        return
    }

    // Init-volgorde (ST app note)
    const inits: [number, number][] = [
        [0x0207, 0x01], [0x0208, 0x01], [0x0096, 0x00], [0x0097, 0xfd],
        [0x00e3, 0x00], [0x00e4, 0x04], [0x00e5, 0x02], [0x00e6, 0x01],
        [0x00e7, 0x03], [0x00f5, 0x02], [0x00d9, 0x05], [0x00db, 0xce],
        [0x00dc, 0x03], [0x00dd, 0xf8], [0x009f, 0x00], [0x00a3, 0x3c],
        [0x00b7, 0x00], [0x00bb, 0x3c], [0x00b2, 0x09], [0x00ca, 0x09],
        [0x0198, 0x01], [0x01b0, 0x17], [0x01ad, 0x00], [0x00ff, 0x05],
        [0x0100, 0x05], [0x0199, 0x05], [0x01a6, 0x1b], [0x01ac, 0x3e],
        [0x01a7, 0x1f], [0x0030, 0x00]
    ]
    for (let [reg, val] of inits) {
        let buf = pins.createBuffer(3)
        buf[0] = reg >> 8
        buf[1] = reg & 0xff
        buf[2] = val
        pins.i2cWriteBuffer(addr, buf)
    }

    vl6180xGeinitialiseerd = true
    serial.writeLine("VL6180X succesvol geïnitialiseerd")
}

/**
 * Meet afstand in millimeters met de VL6180X TOF050C sensor
 */
//% group="Afstandssensor"
//% block="Meet afstand (mm)"
export function meetAfstand(): number {
    const addr = 0x29
    const RANGE_START = 0x018
    const RANGE_RESULT = 0x062
    const RANGE_STATUS = 0x04d

    if (!vl6180xGeinitialiseerd) initVL6180X()

    // Start meting
    pins.i2cWriteNumber(addr, RANGE_START, NumberFormat.UInt8BE)
    basic.pause(10)

    // Lees status
    pins.i2cWriteNumber(addr, RANGE_STATUS, NumberFormat.UInt8BE)
    let status = pins.i2cReadNumber(addr, NumberFormat.UInt8BE) & 0x0F
    if (status != 0) {
        serial.writeLine("Afstandsmeting ongeldig (status: " + status + ")")
        return -1
    }

    // Lees resultaat
    pins.i2cWriteNumber(addr, RANGE_RESULT, NumberFormat.UInt8BE)
    const afstand = pins.i2cReadNumber(addr, NumberFormat.UInt8BE)
    serial.writeLine("Afstand (mm): " + afstand)
    return afstand
}
