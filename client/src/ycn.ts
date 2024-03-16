import { IndividualEventResults } from "./IndividualResultTypes";
import { Dance, STYLE_MAP, Skill, Style, standardizeDance, standardizeSkill, standardizeStyle } from "./ballroom";

export interface YcnResult {
    style: Style;
    dance: Dance;
    skill: Skill;
    points: number;
}

export type YcnResultSkillMap = Record<Skill, number>;

export type YcnResultDanceMap = Partial<Record<Dance, YcnResultSkillMap>>;

export type YcnResultMap = Record<Style, YcnResultDanceMap>;

export const YCN_MAX_POINTS_PER_SKILL = 7;

function isNotNull<TValue>(value: TValue | null): value is TValue {
    if (value === null) {
        return false;
    }
    const testDummy: TValue = value;
    return true;
}

function isDefined<TValue>(value: TValue | undefined): value is TValue {
    if (value === undefined) {
        return false;
    }
    const testDummy: TValue = value;
    return true;
}

export function setupEmptyResultMap(): YcnResultMap {
    return Object.entries(Style).reduce(
        (styleAcc, [_, style]) => {
            styleAcc[style] = STYLE_MAP[style].reduce((danceAcc, dance) => {
                danceAcc[dance] = Object.entries(Skill).reduce((skillAcc, [_, skill]) => {
                    if (typeof skill !== "string") {
                        skillAcc[skill] = 0;
                    }
                    return skillAcc;
                }, {} as YcnResultSkillMap);
                return danceAcc;
            }, {} as YcnResultDanceMap);
            return styleAcc
        }, {} as YcnResultMap
    );
}

export function calculateYcnPointsFromEvent(event: IndividualEventResults): YcnResult[] | null {
    const eventName = event.name;
    const skill = standardizeSkill(eventName);
    const eventDances = (event.dances ?? []).map(standardizeDance).filter(isNotNull<Dance>);
    const style = standardizeStyle(eventName, eventDances);
    const placement = event.placement;
    const numRounds = event.numRounds ?? 1;
    let numPoints = 0;
    if (numRounds <= 1) {
        return null;
    }

    if (placement === 1) {
        numPoints = 3;
    }
    else if (placement === 2) {
        numPoints = 2;
    }
    else if (placement === 3 || (placement <= 6 && numRounds >= 3)) {
        numPoints = 1;
    }

    if (style === null
        || skill === null
        || eventDances.length === 0
        || numPoints === 0) {
        return null;
    }

    return eventDances.map(dance => ({
        style,
        dance,
        skill,
        points: numPoints
    }));
}

// TODO: Unit test this
export function calculateYcnPoints(events: IndividualEventResults[]): YcnResultMap {
    const pointMap = setupEmptyResultMap();

    events.forEach(event => {
        const ycnPoints = calculateYcnPointsFromEvent(event);
        if (!ycnPoints) {
            return;
        }

        ycnPoints.forEach(ycn => {
            const skillMap = pointMap[ycn.style][ycn.dance];
            if (skillMap !== undefined) {
                skillMap[ycn.skill] += ycn.points;
                if (ycn.skill.valueOf() >= 1) {
                    let previousSkill: Skill = ycn.skill - 1;
                    skillMap[previousSkill] += ycn.points * 2;
                    for (let i = ycn.skill.valueOf() - 2; i >= 0; --i) {
                        previousSkill = i;
                        skillMap[previousSkill] += YCN_MAX_POINTS_PER_SKILL;
                    }
                }
            }
        });
    });

    return pointMap;
}

export function getMaxDanceableLevelByStyle(ycnResults: YcnResultMap): Record<Style, Skill> {
    const maxLevelByStyle = Object.entries(Style).reduce((styleAcc, [_, style]) => {
        let maxSkillForStyle = Skill.Newcomer;

        const styleResults = ycnResults[style];
        STYLE_MAP[style].forEach((dance) => {
            let maxSkillForDance = Skill.Championship;
            for (const [_, skill] of Object.entries(Skill).reverse()) {
                const skillMap = styleResults[dance];
                if (typeof skill !== "string" && skillMap) {
                    const skillPoints = skillMap[skill];
                    if (skillPoints >= YCN_MAX_POINTS_PER_SKILL) {
                        break;
                    }
                    maxSkillForDance = skill;
                }
            }
            if (maxSkillForDance > maxSkillForStyle) {
                maxSkillForStyle = maxSkillForDance;
            }
        });

        styleAcc[style] = maxSkillForStyle;

        return styleAcc;
    }, {} as Record<Style, Skill>);

    return maxLevelByStyle;
}