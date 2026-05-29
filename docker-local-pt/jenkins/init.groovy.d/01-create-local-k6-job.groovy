import jenkins.model.Jenkins
import org.jenkinsci.plugins.workflow.job.WorkflowJob
import org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition

def jenkins = Jenkins.instance
def jobName = 'local-k6-mock-pipeline'
def candidates = [
  '/workspace/docker-local-pt/jenkins/pipelines/Jenkinsfile.local-k6-mock',
  '/usr/share/jenkins/ref/jenkins-pipelines/Jenkinsfile.local-k6-mock',
]
def scriptPath = candidates.find { new File(it).exists() }
if (!scriptPath) {
  println("WARN: Jenkinsfile not found. Checked: ${candidates}")
  return
}
def script = new File(scriptPath).text

def job = jenkins.getItem(jobName)
if (job == null) {
  job = jenkins.createProject(WorkflowJob, jobName)
  println("Created pipeline job: ${jobName}")
} else {
  println("Updating existing pipeline job: ${jobName}")
}

job.setDefinition(new CpsFlowDefinition(script, true))
job.setDescription('Local Docker mock k6 PT. Targets mock-api. Optional Influx/Grafana via USE_GRAFANA_OUTPUT.')
job.save()
jenkins.save()
println("Configured Jenkins pipeline job: ${jobName} from ${scriptPath}")
