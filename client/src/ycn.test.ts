import { IndividualEventResults } from "./IndividualResultTypes";
import { Dance, Skill, Style } from "./ballroom";
import { YcnResultMap, calculateYcnPointsFromEvent, getMaxDanceableLevelByStyle, setupEmptyResultMap } from "./ycn";

type YcnPartialResultSkillMap = Partial<Record<Skill, number>>;

type YcnPartialResultDanceMap = Partial<Record<Dance, YcnPartialResultSkillMap>>;

type YcnPartialResultMap = Partial<Record<Style, YcnPartialResultDanceMap>>;

function fullResultsFromPartialResultMap(partialResultsMap: YcnPartialResultMap): YcnResultMap {
    const results = setupEmptyResultMap();

    Object.entries(partialResultsMap).forEach(([style, danceMap]) => {
        Object.entries(danceMap).forEach(([dance, skillMap]) => {
            Object.entries(skillMap).forEach(([skillStr, points]) => {
                const skillMap = results[style as Style][dance as Dance];
                if (!skillMap) {
                    return;
                }
                const skill: Skill = parseInt(skillStr);
                skillMap[skill] += points;
            });
        });
    });

    return results;
}

test('calculateYcnPointsFromEvent_onlyFinal_noPoints', () => {
    // Given
    const eventResults: IndividualEventResults = {
        name: "Silver American Waltz",
        compId: "",
        id: "",
        url: "",
        dances: ["Waltz"],
        placement: 1,
        numRounds: 1,
    };

    // When
    const results = calculateYcnPointsFromEvent(eventResults);

    // Then
    expect(results).toBeNull();
});

test('calculateYcnPointsFromEvent_firstMultipleRounds_threePoints', () => {
    // Given
    const eventResults: IndividualEventResults = {
        name: "Silver American Waltz",
        compId: "",
        id: "",
        url: "",
        dances: ["Waltz"],
        placement: 1,
        numRounds: 2,
    };

    // When
    const results = calculateYcnPointsFromEvent(eventResults);

    // Then
    expect(results).not.toBeNull();
    if (!results) return;
    expect(results).toHaveLength(1);
    expect(results[0]).toStrictEqual({
        style: Style.Smooth,
        dance: Dance.Waltz,
        skill: Skill.Silver,
        points: 3
    });
});

test('calculateYcnPointsFromEvent_secondMultipleRounds_twoPoints', () => {
    // Given
    const eventResults: IndividualEventResults = {
        name: "Silver American Waltz",
        compId: "",
        id: "",
        url: "",
        dances: ["Waltz"],
        placement: 2,
        numRounds: 2,
    };

    // When
    const results = calculateYcnPointsFromEvent(eventResults);

    // Then
    expect(results).not.toBeNull();
    if (!results) return;
    expect(results).toHaveLength(1);
    expect(results[0]).toStrictEqual({
        style: Style.Smooth,
        dance: Dance.Waltz,
        skill: Skill.Silver,
        points: 2
    });
});

test('calculateYcnPointsFromEvent_thirdMultipleRounds_onePoint', () => {
    // Given
    const eventResults: IndividualEventResults = {
        name: "Silver American Waltz",
        compId: "",
        id: "",
        url: "",
        dances: ["Waltz"],
        placement: 3,
        numRounds: 2,
    };

    // When
    const results = calculateYcnPointsFromEvent(eventResults);

    // Then
    expect(results).not.toBeNull();
    if (!results) return;
    expect(results).toHaveLength(1);
    expect(results[0]).toStrictEqual({
        style: Style.Smooth,
        dance: Dance.Waltz,
        skill: Skill.Silver,
        points: 1
    });
});

test('calculateYcnPointsFromEvent_fourthTwoRounds_noPoints', () => {
    // Given
    const eventResults: IndividualEventResults = {
        name: "Silver American Waltz",
        compId: "",
        id: "",
        url: "",
        dances: ["Waltz"],
        placement: 4,
        numRounds: 2,
    };

    // When
    const results = calculateYcnPointsFromEvent(eventResults);

    // Then
    expect(results).toBeNull();
});

test('calculateYcnPointsFromEvent_fourthManyRounds_onePoint', () => {
    // Given
    const eventResults: IndividualEventResults = {
        name: "Silver American Waltz",
        compId: "",
        id: "",
        url: "",
        dances: ["Waltz"],
        placement: 4,
        numRounds: 3,
    };

    // When
    const results = calculateYcnPointsFromEvent(eventResults);

    // Then
    expect(results).not.toBeNull();
    if (!results) return;
    expect(results).toHaveLength(1);
    expect(results[0]).toStrictEqual({
        style: Style.Smooth,
        dance: Dance.Waltz,
        skill: Skill.Silver,
        points: 1
    });
});

test('calculateYcnPointsFromEvent_seventhManyRounds_noPoints', () => {
    // Given
    const eventResults: IndividualEventResults = {
        name: "Silver American Waltz",
        compId: "",
        id: "",
        url: "",
        dances: ["Waltz"],
        placement: 7,
        numRounds: 10,
    };

    // When
    const results = calculateYcnPointsFromEvent(eventResults);

    // Then
    expect(results).toBeNull();
});

test('calculateYcnPointsFromEvent_fourthManyRoundsMultiDance_onePointEach', () => {
    // Given
    const eventResults: IndividualEventResults = {
        name: "Silver Smooth",
        compId: "",
        id: "",
        url: "",
        dances: ["Waltz", "Tango"],
        placement: 4,
        numRounds: 3,
    };

    // When
    const results = calculateYcnPointsFromEvent(eventResults);

    // Then
    expect(results).not.toBeNull();
    if (!results) return;
    expect(results).toHaveLength(2);
    results.forEach(result => {
        expect(result.points).toBe(1);
    })
});

test('getMaxDanceableLevelByStyle_oneDanceSilver', () => {
    // Given
    const ycnResults = fullResultsFromPartialResultMap({
        [Style.Smooth]: {
            [Dance.Waltz]: {
                [Skill.Bronze]: 8,
            }
        },
    });

    // When
    const result = getMaxDanceableLevelByStyle(ycnResults);

    // Then
    expect(result).toEqual({
        [Style.Smooth]: Skill.Silver,
        [Style.Standard]: Skill.Newcomer,
        [Style.Rhythm]: Skill.Newcomer,
        [Style.Latin]: Skill.Newcomer,
    });
});

test('getMaxDanceableLevelByStyle_notEnoughPoints', () => {
    // Given
    const ycnResults = fullResultsFromPartialResultMap({
        [Style.Smooth]: {
            [Dance.Waltz]: {
                [Skill.Bronze]: 2,
                [Skill.Silver]: 2
            }
        },
    });

    // When
    const result = getMaxDanceableLevelByStyle(ycnResults);

    // Then
    expect(result).toEqual({
        [Style.Smooth]: Skill.Newcomer,
        [Style.Standard]: Skill.Newcomer,
        [Style.Rhythm]: Skill.Newcomer,
        [Style.Latin]: Skill.Newcomer,
    });
});

test('getMaxDanceableLevelByStyle_differentLevelsWithinStyle', () => {
    // Given
    const ycnResults = fullResultsFromPartialResultMap({
        [Style.Smooth]: {
            [Dance.Waltz]: {
                [Skill.Bronze]: 9,
            },
            [Dance.Foxtrot]: {
                [Skill.Silver]: 7
            }
        },
    });

    // When
    const result = getMaxDanceableLevelByStyle(ycnResults);

    // Then
    expect(result).toEqual({
        [Style.Smooth]: Skill.Gold,
        [Style.Standard]: Skill.Newcomer,
        [Style.Rhythm]: Skill.Newcomer,
        [Style.Latin]: Skill.Newcomer,
    });
});