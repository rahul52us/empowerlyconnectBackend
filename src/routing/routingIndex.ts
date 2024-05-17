import userRouting from "./User";
import companyOrganisation from "./company";
import projectRouting from "./project";
import testimonialRouting from "./testimonial";
import videosRouting from "./video";
import notesRouting from "./notes";
import classRouting from "./class";
import examRouting from "./exam";
import quizRouting from "./quiz";
import blogRouting from "./blog/blog";
import StudentRouting from "./userTypes/student";
import expenseRouting from "./expense.routing";
import TripRouting from "./trip.routing";
import employeRouting from "./employe.routing";
import departmentRouting from "./department.routing";
import requestRouting from './request.routing'

const importRoutings = (app: any) => {
  app.use("/api/auth", userRouting);
  app.use("/api/company", companyOrganisation);
  app.use("/api/employe", employeRouting);
  app.use("/api/project", projectRouting);
  app.use("/api/testimonial", testimonialRouting);
  app.use("/api/videos", videosRouting);
  app.use("/api/notes", notesRouting);
  app.use("/api/class", classRouting);
  app.use("/api/exam", examRouting);
  app.use("/api/quiz", quizRouting);
  app.use("/api/blog", blogRouting);
  app.use("/api/student", StudentRouting);
  app.use("/api/expense", expenseRouting);
  app.use("/api/trip", TripRouting);
  app.use("/api/department", departmentRouting);
  app.use('/api/request', requestRouting)
};

export default importRoutings;
