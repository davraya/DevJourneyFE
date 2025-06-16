import React from "react";
import ProgressCircle from "./ProgressCircle";
import { HStack } from "@chakra-ui/react";
import { WeeklyGoalsResponse } from "../types/WeeklyGoalsResponse";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";




const GoalStack = ({ goals }: { goals: WeeklyGoalsResponse }) => {


  const userId =  useSelector((state: RootState) => state.user.userId);


  return (
    <HStack spacing="5" align="center" padding="20px">
              <ProgressCircle
                label="Informational Interviews"
                goalType='informationalInterviews'
                current={goals.informationalInterviews.actual}
                total={goals.informationalInterviews.goal}
                goalId={goals.id}
                userId={userId}
              />
              <ProgressCircle
                label="Attempted Contacts"
                goalType='attemptedContacts'
                current={goals.attemptedContacts.actual}
                total={goals.attemptedContacts.goal}
                goalId={goals.id}
                userId={userId}
              />

              <ProgressCircle
                label="Job Applications"
                goalType='jobApplications'
                current={goals.jobApplications.actual}
                total={goals.jobApplications.goal}
                goalId={goals.id}
                userId={userId}
              />
              <ProgressCircle
                label="Hours Developing"
                goalType='hoursSpentDeveloping'
                current={goals.hoursSpentDeveloping.actual}
                total={goals.hoursSpentDeveloping.goal}
                goalId={goals.id}
                userId={userId}
              />
              <ProgressCircle
                label="Hours Practicing"
                goalType='hoursSpentPracticing'
                current={goals.hoursSpentPracticing.actual}
                total={goals.hoursSpentPracticing.goal}
                goalId={goals.id}
                userId={userId}
              />
            </HStack>
  );
};

export default GoalStack;