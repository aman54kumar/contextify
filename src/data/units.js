export const DISTANCE_UNITS = [
    {
        category: "Common",
        units: [
            { value: "m", label: "Meters (m)" },
            { value: "km", label: "Kilometers (km)" },
            { value: "ft", label: "Feet (ft)" },
            { value: "mi", label: "Miles (mi)" },
            { value: "cm", label: "Centimeters (cm)" }
        ]
    },
    {
        category: "Astronomy",
        units: [
            { value: "ly", label: "Light Years (ly)" },
            { value: "pc", label: "Parsecs (pc)" },
            { value: "au", label: "Astronomical Units (AU)" }
        ]
    },
    {
        category: "Microscopic",
        units: [
            { value: "nm", label: "Nanometers (nm)" },
            { value: "angstrom", label: "Angstroms (Å)" }
        ]
    }
];

export const WEIGHT_UNITS = [
    {
        category: "Common",
        units: [
            { value: "kg", label: "Kilograms (kg)" },
            { value: "g", label: "Grams (g)" },
            { value: "lb", label: "Pounds (lb)" },
            { value: "oz", label: "Ounces (oz)" },
            { value: "ton", label: "Metric Tons" }
        ]
    },
    {
        category: "Cosmic",
        units: [
            { value: "solar_mass", label: "Solar Masses (M☉)" },
            { value: "earth_mass", label: "Earth Masses (M⊕)" }
        ]
    },
    {
        category: "Atomic",
        units: [
            { value: "u", label: "Atomic Mass Units (u)" },
            { value: "electron_mass", label: "Electron Masses" }
        ]
    }
];

export const TEMPERATURE_UNITS = [
    {
        category: "Common",
        units: [
            { value: "c", label: "Celsius (°C)" },
            { value: "f", label: "Fahrenheit (°F)" },
            { value: "k", label: "Kelvin (K)" }
        ]
    },
    {
        category: "Extreme",
        units: [
            { value: "planck_temp", label: "Planck Temperature" },
            { value: "core_sun", label: "Core of Sun" }
        ]
    }
];

export const TIME_UNITS = [
    {
        category: "Common",
        units: [
            { value: "min", label: "Minutes" },
            { value: "s", label: "Seconds" },
            { value: "h", label: "Hours" },
            { value: "d", label: "Days" }
        ]
    },
    {
        category: "Long Scale",
        units: [
            { value: "y", label: "Years" },
            { value: "millennium", label: "Millennia" },
            { value: "galactic_year", label: "Galactic Years" }
        ]
    },
    {
        category: "Short Scale",
        units: [
            { value: "ms", label: "Milliseconds" },
            { value: "us", label: "Microseconds" },
            { value: "ns", label: "Nanoseconds" },
            { value: "planck_time", label: "Planck Time" }
        ]
    }
];
