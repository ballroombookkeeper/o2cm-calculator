
export const LEVELS = {
    1: "Bronze",
    2: "Silver",
    3: "Gold",
    4: "Novice",
    5: "Pre-champ",
    6: "Championship",
};

export enum Style {
    Smooth,
    Standard,
    Rhythm,
    Latin,
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