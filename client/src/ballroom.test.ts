import { standardizeDance, standardizeStyle, Dance, Style, standardizeSkill, Skill } from "./ballroom";

test('vwaltz1', () => {
    const result = standardizeDance("Viennese Waltz");
    expect(result).toEqual(Dance.VWaltz);
});

test('vwaltz2', () => {
    const result = standardizeDance("v Waltz");
    expect(result).toEqual(Dance.VWaltz);
});

test('vwaltz3', () => {
    const result = standardizeDance("v. Waltz");
    expect(result).toEqual(Dance.VWaltz);
});

test('waltz', () => {
    const result = standardizeDance("Waltz");
    expect(result).toEqual(Dance.Waltz);
});

test('quickstep', () => {
    const result = standardizeDance("quicKstep");
    expect(result).toEqual(Dance.Quickstep);
});

test('no dance', () => {
    const result = standardizeDance("ain't no dance here");
    expect(result).toEqual(null);
});

test('standard_standard', () => {
    const result = standardizeStyle("standard");
    expect(result).toEqual(Style.Standard);
});

test('intl_standard', () => {
    const result = standardizeStyle("intl.", [Dance.VWaltz]);
    expect(result).toEqual(Style.Standard);
});

test('international_standard', () => {
    const result = standardizeStyle("international", [Dance.VWaltz]);
    expect(result).toEqual(Style.Standard);
});

// TODO: Eventually, this may be acceptable
test('americanquickstep_null', () => {
    const result = standardizeStyle("american", [Dance.Quickstep]);
    expect(result).toEqual(null);
});

test('internationalNoDance_null', () => {
    const result = standardizeStyle("international");
    expect(result).toEqual(null);
});

test('standardizeSkill_open_prechamp', () => {
    const result = standardizeSkill("open");
    expect(result).toBe(Skill.Prechamp);
});

test('standardizeSkill_intermediate_silver', () => {
    const result = standardizeSkill("intermediate");
    expect(result).toBe(Skill.Silver);
});