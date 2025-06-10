import React from "react";
import { GraduationCap } from "lucide-react";
import NestedDetailsCard from "./NestedDetailsCard";

const EducationalDetailsSection = ({ selectedDetailEnquiry }) => (
  <>
    <NestedDetailsCard
      icon={GraduationCap}
      title="Current Education Details"
      detailsObject={selectedDetailEnquiry.current_education_details}
    />
    <NestedDetailsCard
      icon={GraduationCap}
      title="Graduation Education Details"
      detailsObject={selectedDetailEnquiry.graduation_education_details}
    />
    <NestedDetailsCard
      icon={GraduationCap}
      title="12th Grade Education Details"
      detailsObject={selectedDetailEnquiry.twelveth_education_details}
    />
    <NestedDetailsCard
      icon={GraduationCap}
      title="10th Grade Education Details"
      detailsObject={selectedDetailEnquiry.tenth_education_details}
    />
  </>
);

export default EducationalDetailsSection;
