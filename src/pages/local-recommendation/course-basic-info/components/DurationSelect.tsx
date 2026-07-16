import { durationOptions } from '../constants/options';
import type { CourseBasicInfoValues } from '../schema';
import CustomSelect from './CustomSelect';

interface DurationSelectProps {
  value?: CourseBasicInfoValues['duration'];
  onChange: (value: CourseBasicInfoValues['duration']) => void;
}

function DurationSelect({ value, onChange }: DurationSelectProps) {
  return (
    <CustomSelect
      id="course-duration"
      options={durationOptions}
      placeholder="여행 기간을 선택해 주세요"
      value={value}
      onChange={onChange}
    />
  );
}

export default DurationSelect;
