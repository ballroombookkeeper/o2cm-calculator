
export enum Skill {
    Newcomer = 0,
    Bronze = 1,
    Silver = 2,
    Gold = 3,
    Novice = 4,
    Prechamp = 5,
    Championship = 6,
}

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

export function standardizeSkill(input: string): Skill | null {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("newcomer")) {
        return Skill.Newcomer;
    }

    if (lowerInput.includes("bronze") || lowerInput.includes("beginner")) {
        return Skill.Bronze;
    }

    if (lowerInput.includes("silver") || lowerInput.includes("intermediate")) {
        return Skill.Silver;
    }

    if (lowerInput.includes("gold") || lowerInput.includes("advanced")) {
        return Skill.Gold;
    }

    if (lowerInput.includes("syllabus") || lowerInput.includes("other")) {
        return Skill.Bronze;  // TODO: Should there be a syllabus Skill level that other logic equates to Bronze?
    }

    if (lowerInput.includes("novice")) {
        return Skill.Novice;
    }

    if (lowerInput.includes("prechamp") || lowerInput.includes("pre-champ")) {
        return Skill.Prechamp;
    }

    if (lowerInput.includes("champ")) {
        return Skill.Championship;
    }

    // Just in case "Open" is part of the event but not indicative of the skill, e.g. "Open Bronze", this will be at the end
    if (lowerInput.includes("open")) {
        return Skill.Prechamp;
    }

    return null;
}