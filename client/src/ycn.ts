import { IndividualEventResults } from "./IndividualResultTypes";
import { Dance, STYLE_MAP, Skill, Style, standardizeDance, standardizeSkill, standardizeStyle } from "./ballroom";

export interface YcnResult {
    style: Style;
    dance: Dance;
    skill: Skill;
    points: number;
}

export type YcnResultSkillMap = Record<Partial<Skill>, number>;

export type YcnResultDanceMap = Record<Partial<Dance>, YcnResultSkillMap>;

export type YcnResultMap = Record<Partial<Style>, YcnResultDanceMap>;

function isNotNull<TValue>(value: TValue | null): value is TValue {
    if (value === null) {
        return false;
    }
    const testDummy: TValue = value;
    return true;
}

// TODO: Unit test this
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
    const pointMap: YcnResultMap = Object.entries(Style).reduce(
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

    events.forEach(event => {
        const ycnPoints = calculateYcnPointsFromEvent(event);
        if (!ycnPoints) {
            return;
        }

        ycnPoints.forEach(ycn => {
            // TODO: Possibly worth verifying all these keys work
            pointMap[ycn.style][ycn.dance][ycn.skill] += ycn.points;
            if (ycn.skill.valueOf() >= 1) {
                let previousSkill: Skill = ycn.skill - 1;
                pointMap[ycn.style][ycn.dance][previousSkill] += ycn.points * 2;
                for (let i = ycn.skill.valueOf() - 2; i >= 0; --i) {
                    previousSkill = i;
                    pointMap[ycn.style][ycn.dance][previousSkill] += 7;
                }
            }
        });
    });

    return pointMap;
}