export enum CourseLevelEnum {
  INTRODUCTORY = 'introductory',
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export const courseLevelTranslationKey = (level: CourseLevelEnum): string =>
  `common.courseLevels.${level}`;
