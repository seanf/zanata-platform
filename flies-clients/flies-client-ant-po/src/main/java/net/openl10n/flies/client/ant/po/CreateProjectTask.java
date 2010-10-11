package net.openl10n.flies.client.ant.po;


import net.openl10n.flies.client.commands.ArgsUtil;
import net.openl10n.flies.client.commands.FliesCommand;
import net.openl10n.flies.client.commands.PutProjectCommand;
import net.openl10n.flies.client.commands.PutProjectOptions;
import org.kohsuke.args4j.Option;

public class CreateProjectTask extends ConfigurableTask implements PutProjectOptions
{
   // private static final Logger log =
   // LoggerFactory.getLogger(CreateProjectTask.class);

   private String proj;
   private String name;
   private String desc;
   private String projectSlug;
   private String projectName;
   private String projectDesc;

   public static void main(String[] args)
   {
      CreateProjectTask task = new CreateProjectTask();
      ArgsUtil.processArgs(args, task);
   }

   @Override
   public String getCommandName()
   {
      return "createproj";
   }

   @Override
   public String getCommandDescription()
   {
      return "Creates a project in Flies";
   }


   @Option(name = "--proj", metaVar = "PROJ", usage = "Flies project ID", required = true)
   public void setVersionProject(String id)
   {
      this.proj = id;
   }

   @Option(name = "--version-name", metaVar = "NAME", usage = "Flies project version name", required = true)
   public void setVersionName(String name)
   {
      this.name = name;
   }

   @Option(name = "--version-desc", metaVar = "DESC", usage = "Flies project version description", required = true)
   public void setVersionDesc(String desc)
   {
      this.desc = desc;
   }


   @Override
   public FliesCommand initCommand()
   {
      return new PutProjectCommand(this);
   }



   public String getVersionProject()
   {
      return this.proj;
   }


   public String getVersionDesc()
   {
      return this.desc;
   }

   public String getVersionName()
   {
      return this.name;
   }

   @Option(name = "--project-slug", metaVar = "PROJ", usage = "Flies project slug/ID", required = true)
   public void setProjectSlug(String id)
   {
      this.projectSlug = id;
   }

   @Override
   @Option(name = "--project-name", metaVar = "NAME", required = true, usage = "Flies project name")
   public void setProjectName(String name)
   {
      this.projectName = name;
   }

   @Override
   @Option(name = "--project-desc", metaVar = "DESC", required = true, usage = "Flies project description")
   public void setProjectDesc(String desc)
   {
      this.projectDesc = desc;
   }

   @Override
   public String getProjectSlug()
   {
      return projectSlug;
   }

   @Override
   public String getProjectDesc()
   {
      return projectDesc;
   }

   @Override
   public String getProjectName()
   {
      return projectName;
   }

}
