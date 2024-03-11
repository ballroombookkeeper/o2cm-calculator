
export const LEVELS = {
    1: "Bronze",
    2: "Silver",
    3: "Gold",
    4: "Novice",
    5: "Pre-champ",
    6: "Championship",
};

export enum Style {
    Smooth = "Smooth",
    Standard = "Standard",
    Rhythm = "Rhythm",
    Latin = "Latin",
}

export enum Dance {
    Waltz = "Waltz",
    Tango = "Tango",
    Foxtrot = "Foxtrot",
    VWaltz = "Viennese Waltz",
    Quickstep = "Quickstep",
    ChaCha = "Cha Cha",
    Rumba = "Rumba",
    Swing = "Swing",
    Mambo = "Mambo",
    Bolero = "Bolero",
    Samba = "Samba",
    Jive = "Jive",
    PasoDoble = "Paso Doble",
}

export const STYLE_MAP: Record<Style, Dance[]> = {
    [Style.Smooth]: [
        Dance.Waltz,
        Dance.Tango,
        Dance.Foxtrot,
        Dance.VWaltz,
    ],
    [Style.Standard]: [
        Dance.Waltz,
        Dance.Tango,
        Dance.Foxtrot,
        Dance.Quickstep,
        Dance.VWaltz,
    ],
    [Style.Rhythm]: [
        Dance.ChaCha,
        Dance.Rumba,
        Dance.Swing,
        Dance.Mambo,
        Dance.Bolero,
    ],
    [Style.Latin]: [
        Dance.ChaCha,
        Dance.Rumba,
        Dance.Samba,
        Dance.Jive,
        Dance.PasoDoble,
    ]
};

export interface StyleDance {
    style: Style;
    dance: Dance;
}

export function standardizeDance(input: string): Dance | null {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes("v. waltz")
        || lowerInput.includes("v waltz")
        || lowerInput.includes("viennese waltz")
        || lowerInput.includes("viennesewaltz")) {
        return Dance.VWaltz;
    }

    for (const [key, value] of Object.entries(Dance)) {
        if (lowerInput.includes(key.toLowerCase())) {
            return value;
        }
    }

    return null;
}

export function standardizeStyle(input: string, dances?: Dance[]): Style | null {
    const lowerInput = input.toLowerCase();
    for (const [key, value] of Object.entries(Style)) {
        if (lowerInput.includes(key.toLowerCase())) {
            return value;
        }
    }

    if (!dances) {
        return null;
    }

    const styles: Style[] = [];
    if (lowerInput.includes("intl.") || lowerInput.includes("international")) {
        styles.push(Style.Standard);
        styles.push(Style.Latin);
    }

    if (lowerInput.includes("am.") || lowerInput.includes("american")) {
        styles.push(Style.Smooth);
        styles.push(Style.Rhythm);
    }

    for (const style of styles) {
        const styleDances = STYLE_MAP[style];
        const intersection = styleDances.filter(dance => dances.indexOf(dance) >= 0);
        if (intersection.length > 0) {
            return style;
        }
    }

    return null;
}