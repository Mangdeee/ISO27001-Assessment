package main

import (
	"fmt"
	"strings"
	"time"
)

// ISO 27001 Clause Templates
var clauseTemplates = map[string]string{
	"4.1": `# Understanding the Organization and its Context (Clause 4.1)

**Classification:** Internal  
This document may only be shared internally without prior confirmation from the owner.

| Version | Approved By | Owner | Date Last Updated | Review Frequency | Next Review | Comments |
|---------|-------------|-------|-------------------|------------------|-------------|----------|
| 1.0 | [Name] | [Name] | [Date] | Annually | [Date] | |

## Contents
- Purpose of This Document
- Internal Issues
- External Issues
- Review Process
- Document Maintenance

## Purpose of This Document
This document outlines the process for understanding the internal and external issues that may affect the organization's ability to achieve the intended outcomes of its Information Security Management System (ISMS).

## Internal Issues
The following internal issues have been identified:

### Organizational Structure and Culture
- [Describe organizational structure]
- [Describe organizational culture and values]

### Information Systems and Technology Infrastructure
- [Describe IT infrastructure]
- [Describe information systems]

### Human Resources and Capabilities
- [Describe workforce capabilities]
- [Describe skills and competencies]

### Financial Resources
- [Describe financial situation]
- [Describe budget constraints]

### Operational Processes
- [Describe key business processes]
- [Describe operational dependencies]

## External Issues
The following external issues have been identified:

### Legal and Regulatory Requirements
- [List applicable laws and regulations]
- [Describe compliance requirements]

### Market Conditions and Competition
- [Describe market environment]
- [Describe competitive landscape]

### Technology Trends
- [Describe relevant technology trends]
- [Describe impact on organization]

### Social and Cultural Factors
- [Describe social factors]
- [Describe cultural considerations]

### Economic Conditions
- [Describe economic environment]
- [Describe economic impact]

## Review Process
This analysis shall be reviewed:
- At least annually
- When significant changes occur in the organization
- When new internal or external issues are identified

## Document Maintenance
### Document Review and Maintenance
This document shall be reviewed and updated as necessary to reflect changes in the organization's context.

### Document Accessibility
This document is accessible to: [List who has access]

### Distribution
This document is distributed to: [List distribution list]`,

	"4.2": `# Understanding the Needs and Expectations of Interested Parties (Clause 4.2)

## Purpose
To identify interested parties relevant to the ISMS and determine their requirements.

## Interested Parties
- Customers
- Employees
- Suppliers and partners
- Regulatory bodies
- Shareholders
- Management

## Requirements Analysis
For each interested party, document:
- Their specific information security requirements
- Legal and contractual obligations
- Expectations and concerns

## Register of Requirements
Maintain a register of all identified requirements and how they are addressed.

## Document Owner
**Owner:** [To be assigned]
**Review Date:** [To be determined]
**Next Review:** [To be determined]`,

	"4.3": `# Information Security Management System (ISMS) Scope Document

**Classification:** Internal  
This document may only be shared internally without prior confirmation from the owner.

| Version | Approved By | Owner | Date Last Updated | Review Frequency | Next Review | Comments |
|---------|-------------|-------|-------------------|------------------|-------------|----------|
| 1.0 | [Name] | [Name] | [Date] | Annually | [Date] | |

## Contents
- Purpose of Document
- Introduction
- Scope Statement
- Purpose of the ISMS
- Context of the Organisation
- Scope of the Information Security Management System
- Risk Assessment & Treatment
- Key Policies & Procedures
- Document Maintenance & Distribution

## Purpose of Document
This document outlines the scope of [Company Name]'s Information Security Management System (ISMS), including the parts of our organisation, processes, and systems that are covered by the ISMS.

The guidance ensures everyone, from employees to management, understands the extent of our information security efforts. It also aligns our ISMS with our business goals, legal requirements, and contractual obligations.

## Introduction
[Provide a brief overview of your organisation, explaining its purpose and services. This provides a useful overview for anyone not familiar with the organisation, such as auditors and external 3rd parties.]

## Scope Statement
The scope of the Information Security Management System (ISMS) at [Company Name] encompasses the protection of all information assets related to our core business operations, including customer data, internal communications, and proprietary information.

## Purpose of the ISMS
The purpose of the ISMS is to:
- Protect information assets from threats
- Ensure business continuity
- Comply with legal, regulatory, and contractual requirements
- Maintain customer and stakeholder confidence

## Context of the Organisation

### Internal Issues
#### Organisational Structure
[Describe organizational structure]

#### Business Processes
[Describe key business processes]

#### Interested Internal Stakeholders
- Management
- Employees
- IT Department
- Security Team

### External Issues
#### Legal, Regulatory, and Contractual Obligations
- [List applicable laws and regulations]
- [List contractual requirements]

#### Technical Environment
[Describe technical environment and infrastructure]

#### Market & Industry Conditions
[Describe market and industry conditions]

#### External Stakeholders
- Customers
- Suppliers
- Regulatory bodies
- Certification bodies

## Scope of the Information Security Management System

### Business Functions Within Scope
- [List business functions included in scope]

### Physical Locations Within Scope
- [List physical locations included in scope]

### Technology Services Within Scope
- [List technology services included in scope]

### Outsourced Services Within Scope
- [List outsourced services included in scope]

## Risk Assessment & Treatment
Risk assessment and treatment activities are conducted in accordance with the Risk Assessment & Treatment Methodology document.

## Key Policies & Procedures
The following policies and procedures support the ISMS:
- Information Security Policy
- Access Control Policy
- Incident Management Procedure
- [List other relevant policies]

## Document Maintenance & Distribution

### Document Review and Maintenance
This document shall be reviewed at least annually or when significant changes occur.

### Document Accessibility
This document is accessible to: [List who has access]

### Distribution
This document is distributed to: [List distribution list]`,

	"5.1": `# Leadership and Commitment (Clause 5.1)

## Purpose
To demonstrate leadership and commitment with respect to the ISMS.

## Management Commitment
Top management shall demonstrate leadership and commitment by:
- Ensuring the ISMS policy and objectives are established
- Ensuring the integration of ISMS requirements into business processes
- Ensuring resources needed for the ISMS are available
- Communicating the importance of information security
- Ensuring the ISMS achieves its intended outcomes

## Leadership Statement
[Statement from top management demonstrating commitment]

## Document Owner
**Owner:** [To be assigned]
**Review Date:** [To be determined]
**Next Review:** [To be determined]`,

	"5.2": `# INFORMATION SECURITY POLICY

**Classification:** Public  
This document may be shared with interested parties outside of [Company Name]

| Version | Approved By | Owner | Date Last Updated | Review Frequency | Next Review | Comments |
|---------|-------------|-------|-------------------|------------------|-------------|----------|
| 1.0 | [Name] | [Name] | [Date] | Annually | [Date] | |

## Contents
- Purpose of This Document
- Scope
- Applicability
- Context of Information Security
- Roles & Responsibilities
- Related ISMS Policies
- Information Security Objectives
- Training and Awareness
- Physical Security
- Oral Communications
- Third-Party Security
- Employment Screening
- Restricting Unauthorised Access
- Appropriate Use of Security Credentials
- Cryptographic Controls
- Information Classifications
- Breaches of Security
- Associated Policies and Documents
- Monitoring and Filtering
- Risk Assessment & Treatment Methodology

## Purpose of This Document
This policy outlines [Company Name]'s overarching approach to information security management and signposts to specific sub-policies within the framework.

## Scope
The Information Security Policy applies to:
- All organisational and customer information, regardless of format
- All individuals associated with [Company Name], including temporary workers and external contractors

## Applicability
This policy applies to all employees, contractors, and third parties who have access to [Company Name]'s information assets.

## Context of Information Security
The scope and context of information security, including the internal and external factors affecting [Company Name], is documented in the 'Information Security Management System (ISMS) Scope Document', which can be accessed here: [provide location or method of access].

## Roles & Responsibilities

### Information Security Group (ISG):
- Approve and oversee the security policy
- Manage the Information Security Management System (ISMS) framework
- Guide and support security efforts within [Company Name]

### Information Security Manager:
- Day-to-day management of the ISMS
- Implementation of security policies and procedures
- Coordination of security activities

### All Employees:
- Comply with this policy and related procedures
- Report security incidents
- Participate in security awareness training

## Related ISMS Policies
This policy is supported by the following policies and procedures:
- Access Control Policy
- Incident Management Procedure
- Business Continuity Plan
- [List other related policies]

## Information Security Objectives
The information security objectives are documented in the ISMS Objectives document and include:
1. Protect information assets from unauthorized access, disclosure, alteration, or destruction
2. Ensure business continuity
3. Comply with applicable legal, regulatory, and contractual requirements
4. Maintain customer and stakeholder confidence

## Training and Awareness
All personnel shall receive appropriate information security awareness training and regular updates in security policies and procedures.

## Physical Security
Physical security measures shall be implemented to protect information assets from unauthorized physical access, damage, and interference.

## Oral Communications
Personnel shall be aware of the sensitivity of information discussed orally and take appropriate precautions.

## Third-Party Security
Third parties with access to [Company Name]'s information assets shall be required to comply with this policy and related security requirements.

## Employment Screening
Appropriate background verification checks shall be conducted for all personnel in accordance with relevant laws and regulations.

## Restricting Unauthorised Access
Access to information and information processing facilities shall be restricted to authorized personnel only.

## Appropriate Use of Security Credentials
All users shall be responsible for the security of their authentication credentials and shall not share them with others.

## Cryptographic Controls
Cryptographic controls shall be used to protect the confidentiality, authenticity, and integrity of information.

## Information Classifications
Information shall be classified according to its sensitivity and value. The following classifications are used:

### "Confidential" Information
Information that, if disclosed, could cause serious harm to [Company Name] or its stakeholders.

**Handling Guidance for Confidential Information:**
- Must be encrypted in transit and at rest
- Access restricted to authorized personnel only
- Must be marked as "Confidential"
- Requires secure disposal

### "Internal" Information
Information intended for internal use only.

**Handling Guidance for Internal Information:**
- Should not be shared externally without authorization
- Access restricted to employees and authorized contractors
- Should be marked as "Internal"

### "Public" Information
Information that can be freely shared with the public.

**Handling Guidance for Public Information:**
- Can be shared publicly
- No special handling requirements

## Breaches of Security
All security incidents and suspected breaches shall be reported immediately to the Information Security Manager or through the incident reporting procedure.

## Associated Policies and Documents
- ISMS Scope Document
- ISMS Objectives
- Risk Assessment & Treatment Methodology
- Incident Management Procedure
- [List other associated documents]

## Monitoring and Filtering
Information systems shall be monitored and filtered as appropriate to detect and prevent security incidents.

## Risk Assessment & Treatment Methodology
Risk assessment and treatment activities are conducted in accordance with the Risk Assessment & Treatment Methodology document.`,

	"6.1": `# Actions to Address Risks and Opportunities (Clause 6.1)

## Purpose
To plan actions to address risks and opportunities.

## Risk Assessment Process
1. Identify information security risks
2. Assess the likelihood and impact
3. Determine risk treatment options
4. Select risk treatment methods
5. Implement risk treatment plans

## Risk Treatment Options
- Risk avoidance
- Risk mitigation
- Risk transfer
- Risk acceptance

## Risk Register
Maintain a risk register documenting all identified risks and their treatment.

## Document Owner
**Owner:** [To be assigned]
**Review Date:** [To be determined]
**Next Review:** [To be determined]`,

	"6.1.3": `# Statement of Applicability (SoA) - Clause 6.1.3

## Purpose
To document which Annex A controls are applicable and the justification for inclusion or exclusion.

## Control Selection
The following Annex A controls have been selected based on the risk assessment:

| Control ID | Control Name | Applicable | Justification | Implementation Status |
|------------|--------------|------------|---------------|----------------------|
[Controls will be listed here]

## Excluded Controls
The following controls are excluded with justification:
[Excluded controls with justification]

## Document Owner
**Owner:** [To be assigned]
**Review Date:** [To be determined]
**Next Review:** [To be determined]`,

	"6.2": `# INFORMATION SECURITY OBJECTIVES

**Classification:** Internal  
This document should not be shared outside of [Company Name] without the written permission of the owner.

| Version | Approved By | Owner | Date Last Updated | Review Frequency | Next Review | Comments |
|---------|-------------|-------|-------------------|------------------|-------------|----------|
| 1.0 | [Name] | [Name] | [Date] | Quarterly | [Date] | |

## Purpose of This Document
The following provides a summary of the current objectives for [Company Name]'s Information Security Management System.

## Key Objectives

| Objective | Key Result | Target | Owner | Timeline |
|-----------|------------|--------|-------|----------|
| 1. Establish a Robust ISMS Framework | Complete ISMS scope definition and documentation | 100% | ISMS Manager | Q1 2024 |
| | Develop and approve all required ISMS policies and procedures | 100% | ISMS Team | Q1 2024 |
| | Conduct initial risk assessment and document risk treatment plans | 100% | Risk Management | Q1 2024 |
| | Establish a risk register and ensure all identified risks are logged | 100% | Risk Management | Q1 2024 |
| 2. Improve Security Awareness | Deliver security awareness training to all employees | 100% | HR Department | Q2 2024 |
| | Achieve 90% completion rate for security awareness training | 90% | HR Department | Q2 2024 |
| | Distribute monthly security newsletters to all employees | 12 issues | IT Security Team | Ongoing |
| 3. Strengthen Technical Security Controls | Implement multi-factor authentication (MFA) for all critical systems | 100% | IT Department | Q2 2024 |
| | Conduct penetration testing and address all critical findings | 100% | IT Security Team | Q2 2024 |
| | Ensure all systems are updated with the latest security patches | 100% | IT Department | Ongoing |
| 4. Ensure Compliance and Preparedness | Conduct an internal audit to assess compliance with ISO 27001 standards | 100% | Internal Auditor | Q3 2024 |
| | Develop a corrective action plan for any identified non-conformities | 100% | ISMS Team | Q3 2024 |
| | Complete a pre-certification audit with an external consultant | 100% | External Consultant | Q3 2024 |
| 5. Achieve ISO 27001 Certification | Select an accredited certification body | 1 selected | Project Manager | Q4 2024 |
| | Successfully pass the ISO 27001 certification audit | Pass | Certification Body | Q4 2024 |

## Review
Objectives shall be reviewed at least quarterly and updated as necessary to reflect changes in the organization's context and requirements.`,

	"7.2": `# Competence (Clause 7.2)

## Purpose
To ensure persons doing work under the organization's control are competent.

## Competence Requirements
- Education
- Training
- Skills
- Experience

## Training Program
- Security awareness training (annually)
- Role-specific training
- Incident response training
- Compliance training

## Training Records
Maintain records of training provided and competencies achieved.

## Document Owner
**Owner:** [To be assigned]
**Review Date:** [To be determined]
**Next Review:** [To be determined]`,

	"7.3": `# Awareness (Clause 7.3)

## Purpose
To ensure persons doing work under the organization's control are aware of the information security policy and their contribution to the ISMS.

## Awareness Topics
- Information security policy
- Information security objectives
- Individual contribution to ISMS effectiveness
- Benefits of improved information security performance
- Consequences of non-compliance

## Communication Methods
- Security awareness sessions
- Email communications
- Intranet resources
- Posters and notices

## Document Owner
**Owner:** [To be assigned]
**Review Date:** [To be determined]
**Next Review:** [To be determined]`,

	"8.1": `# Operational Planning and Control (Clause 8.1)

## Purpose
To plan, implement, and control processes needed to meet information security requirements.

## Operational Controls
- Access control procedures
- Change management procedures
- Incident management procedures
- Backup and recovery procedures
- System monitoring procedures

## Document Owner
**Owner:** [To be assigned]
**Review Date:** [To be determined]
**Next Review:** [To be determined]`,

	"9.1": `# Monitoring, Measurement, Analysis, and Evaluation (Clause 9.1)

## Purpose
To monitor, measure, analyze, and evaluate information security performance.

## Metrics
- Number of security incidents
- Compliance percentage
- Maturity scores
- Training completion rates
- Control effectiveness

## Review Frequency
- Monthly: Incident metrics
- Quarterly: Compliance and maturity
- Annually: Full ISMS review

## Document Owner
**Owner:** [To be assigned]
**Review Date:** [To be determined]
**Next Review:** [To be determined]`,

	"9.2": `# Internal Audit (Clause 9.2)

## Purpose
To conduct internal audits to ensure the ISMS conforms to requirements.

## Audit Schedule
- Frequency: At least annually
- Scope: All ISMS processes
- Methodology: ISO 19011

## Audit Program
- Planning
- Execution
- Reporting
- Follow-up

## Document Owner
**Owner:** [To be assigned]
**Review Date:** [To be determined]
**Next Review:** [To be determined]`,

	"9.3": `# Management Review (Clause 9.3)

## Purpose
To review the ISMS to ensure its continuing suitability, adequacy, and effectiveness.

## Review Inputs
- Status of actions from previous reviews
- Changes in internal and external issues
- Information security performance
- Audit results
- Nonconformities and corrective actions

## Review Outputs
- Decisions and actions related to ISMS improvements
- Resource needs
- Changes to ISMS

## Review Schedule
- Frequency: At least annually
- Participants: Top management and key stakeholders

## Document Owner
**Owner:** [To be assigned]
**Review Date:** [To be determined]
**Next Review:** [To be determined]`,

	"10.1": `# Nonconformity and Corrective Action (Clause 10.1)

## Purpose
To react to nonconformities and take corrective action.

## Nonconformity Process
1. Identify nonconformity
2. Evaluate the need for action
3. Determine and implement corrective action
4. Review effectiveness of corrective action
5. Update risks and opportunities if necessary

## Corrective Action Register
Maintain a register of all nonconformities and corrective actions.

## Document Owner
**Owner:** [To be assigned]
**Review Date:** [To be determined]
**Next Review:** [To be determined]`,

	"10.2": `# Continual Improvement (Clause 10.2)

## Purpose
To continually improve the suitability, adequacy, and effectiveness of the ISMS.

## Improvement Activities
- Regular review of ISMS performance
- Identification of improvement opportunities
- Implementation of improvements
- Measurement of improvement results

## Improvement Register
Maintain a register of improvement initiatives and their status.

## Document Owner
**Owner:** [To be assigned]
**Review Date:** [To be determined]
**Next Review:** [To be determined]`,
}

// Generate document template for a clause
func generateClauseDocument(clauseRef string, assessmentData map[string]interface{}) string {
	// Extract clause number (e.g., "Clause-4.1" -> "4.1")
	clauseNum := extractClauseNumber(clauseRef)
	
	template, exists := clauseTemplates[clauseNum]
	if !exists {
		// Generate a generic template if specific one doesn't exist
		template = generateGenericTemplate(clauseRef, assessmentData)
	}
	
	// Populate template with assessment data
	populated := populateTemplate(template, assessmentData)

	// Inject an audit-ready snapshot + linked records into every document (specific + generic)
	enriched := enrichClauseMarkdown(populated, clauseRef, clauseNum, assessmentData)
	
	return enriched
}

// Extract clause number from reference
func extractClauseNumber(ref string) string {
	ref = strings.ToLower(ref)
	// Handle formats like "Clause-4.1", "4.1", "Clause 4.1"
	parts := strings.FieldsFunc(ref, func(r rune) bool {
		return r == '-' || r == ' ' || r == '_'
	})
	
	for _, part := range parts {
		if strings.HasPrefix(part, "clause") {
			continue
		}
		// Check if it's a number pattern like "4.1"
		if strings.Contains(part, ".") {
			return part
		}
	}
	return ref
}

// Generate generic template for unknown clauses
func generateGenericTemplate(clauseRef string, assessmentData map[string]interface{}) string {
	question := ""
	if q, ok := assessmentData["assessment_question"].(string); ok {
		question = q
	}
	
	return fmt.Sprintf(`# %s

## Purpose
[To be defined based on ISO 27001:2022 requirements]

## Scope
This document applies to [scope to be defined].

## Requirements
%s

## Implementation
[Implementation details to be documented]

## Responsibilities
- **Owner:** [To be assigned]
- **Reviewer:** [To be assigned]

## Review Process
This document shall be reviewed at least annually or when significant changes occur.

## Document Owner
**Owner:** [To be assigned]
**Review Date:** %s
**Next Review:** [To be determined]

## Related Documents
- [List related documents]

## Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | %s | [Author] | Initial version |`,
		clauseRef,
		question,
		time.Now().Format("2006-01-02"),
		time.Now().Format("2006-01-02"))
}

func enrichClauseMarkdown(doc string, clauseRef string, clauseNum string, data map[string]interface{}) string {
	snapshot := buildAssessmentSnapshot(clauseRef, clauseNum, data)
	if snapshot == "" {
		return doc
	}
	return injectAfterFirstHeading(doc, snapshot)
}

func buildAssessmentSnapshot(clauseRef string, clauseNum string, data map[string]interface{}) string {
	standardRef := getString(data, "standard_ref")
	category := getString(data, "category")
	section := getString(data, "section")
	compliance := getString(data, "compliance")
	targetDate := getString(data, "target_date")
	question := getString(data, "assessment_question")
	notes := getString(data, "notes")

	// Maturity (optional)
	currentMat := getString(data, "current_maturity_level")
	targetMat := getString(data, "target_maturity_level")
	currentMatComments := getString(data, "current_maturity_comments")
	targetMatComments := getString(data, "target_maturity_comments")

	// Linked records (optional)
	actionItems, _ := data["action_items"].([]map[string]interface{})
	evidence, _ := data["evidence"].([]map[string]interface{})
	risks, _ := data["risks"].([]map[string]interface{})

	var sb strings.Builder
	sb.WriteString("## Assessment Snapshot\n\n")
	sb.WriteString("| Field | Value |\n")
	sb.WriteString("|---|---|\n")
	sb.WriteString(fmt.Sprintf("| Clause | %s |\n", escapePipes(firstNonEmpty(clauseNum, clauseRef))))
	if standardRef != "" {
		sb.WriteString(fmt.Sprintf("| Standard Reference | %s |\n", escapePipes(standardRef)))
	}
	if category != "" {
		sb.WriteString(fmt.Sprintf("| Category | %s |\n", escapePipes(category)))
	}
	if section != "" {
		sb.WriteString(fmt.Sprintf("| Section | %s |\n", escapePipes(section)))
	}
	if compliance != "" {
		sb.WriteString(fmt.Sprintf("| Compliance | %s |\n", escapePipes(compliance)))
	}
	if targetDate != "" {
		sb.WriteString(fmt.Sprintf("| Target Date | %s |\n", escapePipes(targetDate)))
	}
	sb.WriteString(fmt.Sprintf("| Generated | %s |\n", time.Now().Format("2006-01-02")))

	if question != "" {
		sb.WriteString("\n### Assessment Question\n\n")
		sb.WriteString("> " + escapePipes(question) + "\n")
	}

	if notes != "" {
		sb.WriteString("\n### Notes\n\n")
		sb.WriteString(escapePipes(notes) + "\n")
	}

	if currentMat != "" || targetMat != "" {
		sb.WriteString("\n### Maturity (optional)\n\n")
		if currentMat != "" {
			sb.WriteString(fmt.Sprintf("- **Current maturity**: %s\n", escapePipes(currentMat)))
		}
		if targetMat != "" {
			sb.WriteString(fmt.Sprintf("- **Target maturity**: %s\n", escapePipes(targetMat)))
		}
		if currentMatComments != "" {
			sb.WriteString(fmt.Sprintf("- **Current comments**: %s\n", escapePipes(currentMatComments)))
		}
		if targetMatComments != "" {
			sb.WriteString(fmt.Sprintf("- **Target comments**: %s\n", escapePipes(targetMatComments)))
		}
	}

	// Linked records
	if len(actionItems) > 0 || len(evidence) > 0 || len(risks) > 0 {
		sb.WriteString("\n## Linked Records\n")

		if len(actionItems) > 0 {
			sb.WriteString("\n### Action Items\n\n")
			sb.WriteString("| ID | Title | Status | Priority | Assigned To | Due Date |\n")
			sb.WriteString("|---:|---|---|---|---|---|\n")
			for _, it := range actionItems {
				id := fmt.Sprintf("%v", it["id"])
				title := fmt.Sprintf("%v", it["title"])
				status := fmt.Sprintf("%v", it["status"])
				priority := fmt.Sprintf("%v", it["priority"])
				assigned := fmt.Sprintf("%v", it["assigned_to"])
				due := fmt.Sprintf("%v", it["due_date"])
				if due == "<nil>" {
					due = ""
				}
				sb.WriteString(fmt.Sprintf("| %s | %s | %s | %s | %s | %s |\n",
					escapePipes(id),
					escapePipes(title),
					escapePipes(status),
					escapePipes(priority),
					escapePipes(assigned),
					escapePipes(due),
				))
			}
		}

		if len(evidence) > 0 {
			sb.WriteString("\n### Evidence\n\n")
			sb.WriteString("| ID | Title | File Name | Type | Uploaded By | Uploaded At |\n")
			sb.WriteString("|---:|---|---|---|---|---|\n")
			for _, ev := range evidence {
				id := fmt.Sprintf("%v", ev["id"])
				title := fmt.Sprintf("%v", ev["title"])
				fileName := fmt.Sprintf("%v", ev["file_name"])
				fileType := fmt.Sprintf("%v", ev["file_type"])
				uploadedBy := fmt.Sprintf("%v", ev["uploaded_by"])
				uploadedAt := fmt.Sprintf("%v", ev["uploaded_at"])
				sb.WriteString(fmt.Sprintf("| %s | %s | %s | %s | %s | %s |\n",
					escapePipes(id),
					escapePipes(title),
					escapePipes(fileName),
					escapePipes(fileType),
					escapePipes(uploadedBy),
					escapePipes(uploadedAt),
				))
			}
		}

		if len(risks) > 0 {
			sb.WriteString("\n### Risks\n\n")
			sb.WriteString("| Risk ID | Title | Risk Level | Treatment Status | Owner | Target Date |\n")
			sb.WriteString("|---|---|---|---|---|---|\n")
			for _, rk := range risks {
				riskID := fmt.Sprintf("%v", rk["risk_id"])
				title := fmt.Sprintf("%v", rk["title"])
				level := fmt.Sprintf("%v", rk["risk_level"])
				status := fmt.Sprintf("%v", rk["treatment_status"])
				owner := fmt.Sprintf("%v", rk["owner"])
				target := fmt.Sprintf("%v", rk["target_date"])
				if target == "<nil>" {
					target = ""
				}
				sb.WriteString(fmt.Sprintf("| %s | %s | %s | %s | %s | %s |\n",
					escapePipes(riskID),
					escapePipes(title),
					escapePipes(level),
					escapePipes(status),
					escapePipes(owner),
					escapePipes(target),
				))
			}
		}
	}

	return sb.String()
}

func injectAfterFirstHeading(doc string, insert string) string {
	lines := strings.Split(doc, "\n")
	for i, line := range lines {
		if strings.HasPrefix(line, "# ") {
			out := make([]string, 0, len(lines)+8)
			out = append(out, lines[:i+1]...)
			out = append(out, "")
			out = append(out, insert)
			out = append(out, "")
			out = append(out, lines[i+1:]...)
			return strings.Join(out, "\n")
		}
	}
	// Fallback if document has no H1
	return insert + "\n\n" + doc
}

func escapePipes(s string) string {
	return strings.ReplaceAll(s, "|", "\\|")
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if strings.TrimSpace(v) != "" {
			return v
		}
	}
	return ""
}

// Populate template with assessment data
func populateTemplate(template string, data map[string]interface{}) string {
	result := template
	
	// Replace placeholders with actual data
	if question, ok := data["assessment_question"].(string); ok {
		result = strings.ReplaceAll(result, "[Assessment Question]", question)
	}
	
	if compliance, ok := data["compliance"].(string); ok {
		result = strings.ReplaceAll(result, "[Compliance Status]", compliance)
	}
	
	if notes, ok := data["notes"].(string); ok && notes != "" {
		result = strings.ReplaceAll(result, "[Notes]", notes)
	}
	
	return result
}

// Generate Statement of Applicability
func generateSoA(gapAssessments []map[string]interface{}) string {
	var sb strings.Builder
	
	sb.WriteString("# STATEMENT OF APPLICABILITY (SoA)\n\n")
	sb.WriteString("**Classification:** Internal\n")
	sb.WriteString("This document should not be shared outside of [Company Name] without the written permission of the owner.\n\n")
	
	sb.WriteString("| Version | Approved By | Owner | Date Last Updated | Review Frequency | Next Review | Comments |\n")
	sb.WriteString("|---------|-------------|-------|-------------------|------------------|-------------|----------|\n")
	sb.WriteString(fmt.Sprintf("| 1.0 | [Name] | [Name] | %s | Annually | [Date] | |\n\n", time.Now().Format("2006-01-02")))
	
	sb.WriteString("## Purpose\n")
	sb.WriteString("This Statement of Applicability identifies which Annex A controls are applicable to the ISMS and provides justification for their inclusion or exclusion, as required by Clause 6.1.3 of ISO 27001:2022.\n\n")
	
	sb.WriteString("## Control Applicability Matrix\n\n")
	sb.WriteString("| Control Group | Ref | Name | Control | Applicable (Yes/No) | Justification for any exclusion | Implementation Status | Comment |\n")
	sb.WriteString("|---------------|-----|------|---------|---------------------|--------------------------------|----------------------|----------|\n")
	
	// Group by standard reference
	controlMap := make(map[string][]map[string]interface{})
	for _, assessment := range gapAssessments {
		if ref, ok := assessment["standard_ref"].(string); ok {
			controlMap[ref] = append(controlMap[ref], assessment)
		}
	}
	
	// Generate rows for each control
	for ref, assessments := range controlMap {
		if len(assessments) == 0 {
			continue
		}
		
		assessment := assessments[0]
		compliance := "Not Compliant"
		if c, ok := assessment["compliance"].(string); ok {
			compliance = c
		}
		
		question := ""
		if q, ok := assessment["assessment_question"].(string); ok {
			question = q
			// Truncate if too long
			if len(question) > 50 {
				question = question[:50] + "..."
			}
		}
		
		applicable := "Yes"
		justification := ""
		if compliance == "Not Applicable" {
			applicable = "No"
			justification = "Not applicable to our business context"
		} else {
			justification = "Required based on risk assessment"
		}
		
		if notes, ok := assessment["notes"].(string); ok && notes != "" {
			if justification != "" {
				justification += "; " + notes
			} else {
				justification = notes
			}
			// Truncate justification if too long
			if len(justification) > 80 {
				justification = justification[:80] + "..."
			}
		}
		
		status := "Planned"
		if compliance == "Fully Compliant" {
			status = "Implemented"
		} else if compliance == "Partially Compliant" {
			status = "Partially Implemented"
		}
		
		// Determine control group from reference
		controlGroup := "Organisational Controls"
		if strings.Contains(ref, "A.6") {
			controlGroup = "Human Resource Controls"
		} else if strings.Contains(ref, "A.7") {
			controlGroup = "Physical Controls"
		} else if strings.Contains(ref, "A.8") {
			controlGroup = "Technological Controls"
		} else if strings.Contains(ref, "A.9") {
			controlGroup = "Access Control"
		} else if strings.Contains(ref, "A.10") || strings.Contains(ref, "A.11") || strings.Contains(ref, "A.12") {
			controlGroup = "Cryptographic & Operations Controls"
		} else if strings.Contains(ref, "A.13") {
			controlGroup = "Communications Security"
		} else if strings.Contains(ref, "A.14") {
			controlGroup = "System Acquisition & Development"
		} else if strings.Contains(ref, "A.15") {
			controlGroup = "Supplier Relationships"
		} else if strings.Contains(ref, "A.16") {
			controlGroup = "Incident Management"
		} else if strings.Contains(ref, "A.17") {
			controlGroup = "Business Continuity"
		} else if strings.Contains(ref, "A.18") {
			controlGroup = "Compliance"
		}
		
		sb.WriteString(fmt.Sprintf("| %s | %s | %s | %s | %s | %s | %s | %s |\n",
			controlGroup, ref, "[Control Name]", question, applicable, justification, status, "[Comment]"))
	}
	
	sb.WriteString("\n## Notes\n")
	sb.WriteString("- This SoA is based on the current gap assessment results\n")
	sb.WriteString("- Controls marked as 'Not Applicable' have been excluded with documented justification\n")
	sb.WriteString("- This document shall be reviewed at least annually or when significant changes occur\n")
	sb.WriteString("- Implementation status reflects the current state as of the last assessment\n\n")
	
	sb.WriteString("## Approval\n")
	sb.WriteString("- **Prepared by:** [Name]\n")
	sb.WriteString("- **Reviewed by:** [Name]\n")
	sb.WriteString("- **Approved by:** [Name]\n")
	sb.WriteString(fmt.Sprintf("- **Date:** %s\n", time.Now().Format("2006-01-02")))
	
	return sb.String()
}

// Generate Notion-friendly Markdown export
func generateNotionExport(gapAssessments []map[string]interface{}, maturityAssessments []map[string]interface{}) string {
	var sb strings.Builder
	
	sb.WriteString("# ISO 27001 Assessment Export\n\n")
	sb.WriteString(fmt.Sprintf("**Export Date:** %s\n\n", time.Now().Format("2006-01-02 15:04:05")))
	
	// Gap Assessment Section
	sb.WriteString("## Gap Assessment Summary\n\n")
	sb.WriteString("| Clause | Assessment Question | Compliance Status | Notes |\n")
	sb.WriteString("|--------|---------------------|-------------------|-------|\n")
	
	for _, assessment := range gapAssessments {
		ref := getString(assessment, "standard_ref")
		question := getString(assessment, "assessment_question")
		compliance := getString(assessment, "compliance")
		notes := getString(assessment, "notes")
		
		// Truncate long questions
		if len(question) > 80 {
			question = question[:80] + "..."
		}
		
		sb.WriteString(fmt.Sprintf("| %s | %s | %s | %s |\n",
			ref, question, compliance, notes))
	}
	
	// Maturity Assessment Section
	sb.WriteString("\n## Maturity Assessment Summary\n\n")
	sb.WriteString("| Clause | Assessment Question | Current Level | Target Level |\n")
	sb.WriteString("|--------|---------------------|---------------|--------------|\n")
	
	for _, assessment := range maturityAssessments {
		ref := getString(assessment, "standard_ref")
		question := getString(assessment, "assessment_question")
		current := getString(assessment, "current_maturity_level")
		target := getString(assessment, "target_maturity_level")
		
		if len(question) > 80 {
			question = question[:80] + "..."
		}
		
		sb.WriteString(fmt.Sprintf("| %s | %s | %s | %s |\n",
			ref, question, current, target))
	}
	
	return sb.String()
}

// Helper function to safely get string from map
func getString(m map[string]interface{}, key string) string {
	if val, ok := m[key]; ok {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}
