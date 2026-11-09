# Request for Access to De-identified Alzheimer’s Research Data

**Project:** ROSA — Research & Outreach System for Alzheimer’s  
**Submitted by:** [Student name(s)]  
**School / program:** [School, department, and program]  
**Faculty sponsor:** [Name and title, if applicable]  
**Date:** November 9, 2026  
**Requested institution / data custodian:** [University, center, or principal investigator]

## Request at a glance

We are requesting guidance on whether [University / Research Center] can provide access to an existing, de-identified dataset suitable for a supervised student research project on Alzheimer’s disease. We are especially interested in data that include a reliable diagnostic label and a subset of demographic, health-history, lifestyle, and—only where already available and approved—APOE ε4 information.

We are not asking the university to recruit participants or collect new data for this project. We would welcome a limited dataset, a data-use agreement, or a referral to an approved public or controlled-access resource if direct access is not possible.

## 1. Project summary

ROSA is an educational project exploring how machine-learning methods might study factors associated with Alzheimer’s disease. The current website prototype uses synthetic data and is not a clinical tool. Access to appropriately governed real-world data would let the student team assess whether the prototype’s assumptions and model-building approach are meaningful in a research dataset.

The proposed work is exploratory. It will examine associations and evaluate model performance on held-out data. It will not diagnose individuals, provide medical advice, estimate a person’s future with clinical validity, or guide care. Any results will be described with the dataset’s limitations and will not be presented as evidence that the model is ready for clinical use.

## 2. Research question and objectives

**Research question:** In an existing research cohort, how well can a small set of routinely collected demographic, health-history, and lifestyle variables distinguish participants with a documented Alzheimer’s diagnosis from relevant comparison groups?

The project will:

1. Describe the cohort, diagnostic definitions, data completeness, and relevant limitations.
2. Test whether the available candidate variables contain a reproducible signal for the specified research outcome.
3. Evaluate performance on a participant-level held-out sample, using appropriate measures such as ROC-AUC, sensitivity, specificity, calibration, and confidence intervals where feasible.
4. Examine performance across available demographic subgroups only when sample sizes support responsible analysis.
5. Document how results differ when Alzheimer’s cases are compared separately with cognitively unimpaired controls and with participants who have other dementias or neurological diagnoses.

## 3. Data requested

We are interested in an existing cohort with a clear data dictionary and documented diagnostic criteria. The following fields are requested only if already collected and approved for sharing:

| Area | Preferred fields | Notes |
|---|---|---|
| Outcome / diagnosis | Alzheimer’s diagnosis or diagnostic category; cognitive status; diagnosis source or criteria; assessment date or age at diagnosis where available | Please retain distinct categories for Alzheimer’s, cognitively unimpaired controls, other dementias, and other neurological conditions. A single combined “not Alzheimer’s” label may obscure important differences. |
| Demographics | Age or age band at assessment; sex as recorded; race and ethnicity if permitted and sufficiently complete | Direct identifiers are not requested. Coarse categories are acceptable where needed to reduce disclosure risk. |
| Health history | Family history of Alzheimer’s or dementia; significant head injury; medication count or a suitably broad summary; BMI | Definitions, units, and assessment time points are requested. Detailed medication names are not necessary. |
| Lifestyle | Typical sleep duration and exercise frequency, if available | Self-report or measurement method and timing should be documented. |
| Genetics (optional) | APOE ε4 carrier status or allele dosage, only if already available and specifically permitted | No raw sequence data or unrelated genetic results are requested. This field may be omitted without preventing the project from proceeding. |
| Data quality / study context | De-identified participant code; cohort/site indicator if shareable; missingness indicators; data dictionary; diagnostic and collection protocols | A study-specific random ID is useful for keeping each participant’s records together and preventing duplicate-person leakage across analysis splits. |

We are not requesting names, contact details, full dates of birth, addresses, medical-record numbers, free-text notes, raw genomic sequences, or other direct identifiers. Exact dates are not required; relative time, year, age, or age band is sufficient where appropriate.

## 4. Requested scope and format

We would prefer a small, de-identified extract from an existing cohort, or an approved data enclave / controlled-access workflow. A comma-separated or tabular file with a data dictionary is sufficient. We can work with a smaller pilot extract if a larger sample is not appropriate.

If the data custodian considers it feasible, a cohort with enough Alzheimer’s cases and comparison participants to support a held-out evaluation would be helpful. We do not require a particular sample size; the university’s available cohort and disclosure-risk rules should determine what can be shared. Cohort composition and sampling design will be recorded so that performance is not misrepresented as population prevalence or general clinical accuracy.

## 5. Proposed analysis

The team will first review the data dictionary and confirm which variables are available, how they were measured, and how diagnosis was established. We will agree on one primary comparison with the data custodian or faculty sponsor before fitting models. Secondary comparisons will keep diagnostic groups separate where possible.

Analysis will use participant-level separation between training and test data. If records are longitudinal, all records from one participant will remain in a single split. The team will avoid using post-diagnostic symptoms, cognitive test results, biomarkers, or fields that directly encode the diagnosis as predictors for a risk-screening question. If such fields are present, they may be used to understand cohort definitions but will be excluded from the specified screening model unless a separate, clearly labeled analysis is approved.

The analysis will compare simple baseline methods with a limited machine-learning model, report uncertainty and class balance, and describe missing-data handling. Results will be interpreted as performance within the supplied cohort. External validation would be needed before any claim about other populations. We will not deploy the model for patient-facing decisions.

## 6. Privacy, security, and oversight

We will follow the data custodian’s requirements and the school’s research policies. Before receiving or analyzing any non-public human-subjects data, we will obtain the required faculty, institutional, ethics-board, and data-access determinations. We will not assume that the project is exempt from review; the responsible institution will make that determination.

The team will:

- Use the data only for the approved project and only through the approved storage and access method.
- Limit access to named team members and the faculty sponsor, as required by the agreement.
- Avoid attempts to identify participants, link records to outside sources, or disclose small cells or individual-level data.
- Not upload restricted data to public repositories, public code hosting, or third-party AI services.
- Retain or destroy the data according to the custodian’s written instructions and document completion if requested.
- Share only aggregate findings and project code that contains no restricted data, subject to institutional review.

If the institution cannot share a row-level dataset, we would welcome aggregate results, a synthetic extract, a supervised analysis in an approved environment, or advice on an appropriate public dataset and its access process.

## 7. Expected outputs

Subject to the data-use terms and institutional approval, expected outputs are:

- A student research report describing the cohort, methods, limitations, and results.
- A presentation or poster for an educational or student research setting, if publication is permitted.
- Revised project documentation and, where allowed, analysis code that does not contain or expose restricted data.

The institution and data contributors will be acknowledged as directed by the data custodian. We will obtain written permission before naming a collaborator, institution, cohort, or data source in public materials. We will share a draft report with the designated contact for review of privacy, data-use compliance, and factual descriptions of the cohort before public release.

## 8. Proposed timeline

The schedule will be adjusted to the institution’s review and data-access process.

| Stage | Estimated timing after approval and access |
|---|---|
| Confirm scope, data dictionary, and analysis plan | 2–3 weeks |
| Data review and quality assessment | 2–4 weeks |
| Analysis and validation | 3–5 weeks |
| Report and institutional review | 2–3 weeks |

## 9. Request to the university

We would appreciate guidance on:

1. Whether an appropriate existing cohort or dataset may be available for this student project.
2. The correct investigator, data-access, and ethics-review contacts and application process.
3. Whether a faculty sponsor or formal institutional affiliation is required before an application can be considered.
4. Applicable data-use agreements, security requirements, costs, training, and expected review timelines.
5. Whether the proposed variables and student-level scope are suitable, or should be narrowed to fit the available data and oversight requirements.

Thank you for considering this request. We are glad to revise the research question and requested fields to match the institution’s available data and governance process.

**Primary contact:** [Name]  
**Email:** [School or project email]  
**Faculty sponsor:** [Name, title, email]  
**Project website or repository:** [Link, if appropriate]

---

*Before sending: replace all bracketed fields; confirm the project team, faculty sponsor, institution, and requested dataset; and have the faculty sponsor or institutional contact review the proposal and required oversight language.*
