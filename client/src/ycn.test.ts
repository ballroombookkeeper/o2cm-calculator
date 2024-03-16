import { Dance, Skill, Style } from "./ballroom";
import { YcnResultMap, getMaxDanceableLevelByStyle, setupEmptyResultMap } from "./ycn";

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