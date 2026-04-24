# Milestone 4

This document should be completed and submitted during **Unit 8** of this course. You **must** check off all completed tasks in this document in order to receive credit for your work.

## Checklist

This unit, be sure to complete all tasks listed below. To complete a task, place an `x` between the brackets.

- [x] Update the completion percentage of each GitHub Milestone. The milestone for this unit (Milestone 4 - Unit 8) should be 100% completed when you submit for full points.
- [x] In `readme.md`, check off the features you have completed in this unit by adding a ✅ emoji in front of the feature's name.
  - [x] Under each feature you have completed, include a GIF showing feature functionality.
- [x] In this document, complete all five questions in the **Reflection** section below.

## Reflection

### 1. What went well during this unit?

Our team made significant progress this unit by implementing several key features that improved both the functionality and user experience of StudyBuddy Planner. We successfully added a priority field (high, medium, low) to the task creation and editing form, integrated a progress bar to track task completion, and added filtering by status and priority. The search bar in the navigation header also came together smoothly, allowing users to quickly find tasks by title or description. Overall, the team collaborated effectively and was able to complete all planned sprint tasks.

### 2. What were some challenges your group faced in this unit?

One of the main challenges we faced was a database connection issue caused by quoted values in the .env file, which prevented the server from authenticating with the Neon PostgreSQL database. Debugging this took time since the server appeared to start correctly but failed silently on database queries. We also encountered a missing bcryptjs dependency after merging the authentication branch from main, which caused the server to crash on startup. Learning to read error messages carefully and trace them back to their root cause was an important skill we developed this unit.

### Did you finish all of your tasks in your sprint plan for this week? If you did not finish all of the planned tasks, how would you prioritize the remaining tasks on your list?

Yes, we completed all planned tasks for this sprint. The features we finished include:

#22 Added description and priority field to the create/edit task form
#18 Added new columns to the task list (priority badge, status indicator, progress bar, filters)
#17 Added confirmation prompts before editing or deleting a task
#15 Added a navigation menu with a Log Out button in the header
#21 Added a search bar in the navigation header

If any tasks had remained incomplete, we would have prioritized the confirmation prompts and priority field first, as they directly impact the core user experience and are required for the baseline feature set.

### Which features and user stories would you consider “at risk”? How will you change your plan if those items remain “at risk”?

At this point, the main feature that remains at risk is deployment to Render, which is required for Milestone 5. If deployment issues arise, we plan to allocate extra time to configure environment variables correctly on Render, ensure the build process works for both the client and server, and test all features in the production environment. We will also prioritize completing the final demo GIF and updating the README before the Milestone 5 deadline.

### 5. What additional support will you need in upcoming units as you continue to work on your final project?

In the upcoming unit, we may need additional support with deploying a full-stack application to Render, particularly around setting up environment variables, configuring the build command, and ensuring the server serves the React frontend correctly in production. Guidance on recording a complete walkthrough GIF that demonstrates all features would also be helpful for completing the Milestone 5 submission requirements.
