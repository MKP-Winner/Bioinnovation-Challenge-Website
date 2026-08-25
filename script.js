const page =
  location.pathname.split('/').pop() ||
  'index.html';


/* =========================
   ACTIVE NAVIGATION
========================= */

document
  .querySelectorAll('.nav-links a')
  .forEach(link => {

    const href =
      link.getAttribute('href');

    if (
      href === page ||
      (page === '' && href === 'index.html')
    ) {
      link.classList.add('active');
    }

  });


/* =========================
   SCROLL REVEAL
========================= */

const observer =
  new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }

      });

    },
    {
      threshold:0.12
    }
  );


document
  .querySelectorAll('.reveal')
  .forEach(el => {

    observer.observe(el);

  });


/* =========================
   GENE INFORMATION
========================= */

const geneInfo = {

  APOE:{
    title:'APOE ε4',
    type:'Risk-associated variant',
    text:
      'APOE ε4 is the best-known genetic risk factor for late-onset Alzheimer’s. It changes risk; it does not by itself diagnose Alzheimer’s or guarantee that someone will develop it.'
  },

  APP:{
    title:'APP',
    type:'Rare deterministic gene',
    text:
      'Rare inherited changes in APP can cause a form of dominantly inherited Alzheimer’s disease, often with younger onset.'
  },

  PSEN1:{
    title:'PSEN1',
    type:'Rare deterministic gene',
    text:
      'Rare PSEN1 variants can cause dominantly inherited Alzheimer’s disease and are a major cause of inherited early-onset disease.'
  },

  PSEN2:{
    title:'PSEN2',
    type:'Rare deterministic gene',
    text:
      'Rare PSEN2 variants can cause dominantly inherited Alzheimer’s disease, although they are less common than PSEN1 changes.'
  },

  TREM2:{
    title:'TREM2',
    type:'Risk-associated gene',
    text:
      'Variants in TREM2 are among the genes studied for their relationship to Alzheimer’s risk and microglial immune function.'
  }

};


const geneDetails =
  document.getElementById('geneDetails');


document
  .querySelectorAll('[data-gene]')
  .forEach(btn => {

    btn.addEventListener(
      'click',
      () => {

        const key =
          btn.dataset.gene;

        const info =
          geneInfo[key];

        if (
          !info ||
          !geneDetails
        ) {
          return;
        }

        geneDetails.innerHTML = `

          <div class="eyebrow">
            Selected marker
          </div>

          <h3>
            ${info.title}
          </h3>

          <p>
            <strong>
              ${info.type}
            </strong>
          </p>

          <p
            style="
              margin-top:10px;
              color:var(--muted)
            "
          >
            ${info.text}
          </p>

        `;

        geneDetails.scrollIntoView({
          behavior:'smooth',
          block:'center'
        });

      }
    );

  });


/* =========================
   APOE INTERACTION
========================= */

const copies =
  document.getElementById('copies');

const copiesValue =
  document.getElementById('copiesValue');

const riskFill =
  document.getElementById('riskFill');

const riskMessage =
  document.getElementById('riskMessage');


if (
  copies &&
  copiesValue &&
  riskFill &&
  riskMessage
) {

  const updateRisk = () => {

    const n =
      Number(copies.value);

    copiesValue.textContent =
      `${n} ${
        n === 1
          ? 'copy'
          : 'copies'
      }`;

    const width =
      n === 0
        ? 18
        : n === 1
          ? 50
          : 86;

    riskFill.style.width =
      width + '%';


    if (n === 0) {

      riskMessage.innerHTML = `

        <strong>
          APOE ε4 not selected
        </strong>

        This educational control does not
        represent a clinical risk estimate.

      `;

    }

    else if (n === 1) {

      riskMessage.innerHTML = `

        <strong>
          One APOE ε4 copy selected
        </strong>

        APOE ε4 is associated with increased risk,
        but the result cannot predict an individual outcome.

      `;

    }

    else {

      riskMessage.innerHTML = `

        <strong>
          Two APOE ε4 copies selected
        </strong>

        Two copies are associated with higher risk
        than one copy, but genetics alone still cannot
        determine whether Alzheimer’s will develop.

      `;

    }

  };


  copies.addEventListener(
    'input',
    updateRisk
  );

  updateRisk();

}


/* =========================
   DEMO DATABASE
========================= */

const sampleRecords = [

  {
    id:'DEMO-001',
    sample:'Research Sample A',
    gene:'APOE',
    variant:'ε4',
    status:'Research',
    note:'Illustrative record only'
  },

  {
    id:'DEMO-002',
    sample:'Research Sample B',
    gene:'APP',
    variant:'Variant pending',
    status:'Research',
    note:'Illustrative record only'
  },

  {
    id:'DEMO-003',
    sample:'Research Sample C',
    gene:'PSEN1',
    variant:'Variant pending',
    status:'Research',
    note:'Illustrative record only'
  },

  {
    id:'DEMO-004',
    sample:'Research Sample D',
    gene:'TREM2',
    variant:'Variant pending',
    status:'Research',
    note:'Illustrative record only'
  }

];


const dbTable =
  document.getElementById('dbTable');

const dbSearch =
  document.getElementById('dbSearch');

const dbFilter =
  document.getElementById('dbFilter');


function renderDatabase(){

  if (!dbTable) {
    return;
  }

  const q =
    (
      dbSearch?.value ||
      ''
    ).toLowerCase();

  const f =
    dbFilter?.value ||
    'All';


  const rows =
    sampleRecords.filter(record => {

      const matchesText =
        Object
          .values(record)
          .join(' ')
          .toLowerCase()
          .includes(q);

      const matchesFilter =
        f === 'All' ||
        record.gene === f;

      return (
        matchesText &&
        matchesFilter
      );

    });


  dbTable.innerHTML =
    rows.length

      ? rows.map(record => `

          <tr>

            <td>
              ${record.id}
            </td>

            <td>
              ${record.sample}
            </td>

            <td>
              <strong>
                ${record.gene}
              </strong>
            </td>

            <td>
              ${record.variant}
            </td>

            <td>
              ${record.status}
            </td>

            <td>
              ${record.note}
            </td>

          </tr>

        `).join('')

      : `

        <tr>

          <td
            colspan="6"
            class="empty-state"
          >
            No matching records.
          </td>

        </tr>

      `;

}


dbSearch?.addEventListener(
  'input',
  renderDatabase
);

dbFilter?.addEventListener(
  'change',
  renderDatabase
);

renderDatabase();


/* =========================
   FOOTER YEAR
========================= */

const year =
  document.getElementById('year');

if (year) {

  year.textContent =
    new Date().getFullYear();

}


/* =========================
   MODEL PREDICTION
========================= */

const predictionForm =
  document.getElementById('predictionForm');

const predictionFields =
  document.getElementById('predictionFields');

const modelStatus =
  document.getElementById('modelStatus');

const predictButton =
  document.getElementById('predictButton');

const predictionResult =
  document.getElementById('predictionResult');

const API_URL =
  'http://127.0.0.1:5000';

const demoValues = {
  Age: 67,
  Height: 162,
  Weight: 68.5,
  BMI: 26.1,
  Sex: 'Female',
  Education_Level: 'Bachelors',
  Occupation: 'Retired',
  Marital_Status: 'Married',
  Ethnicity: 'Caucasian',
  Residence_Type: 'Urban',
  Socioeconomic_Status: 'Medium',
  Smoking_Status: 'Never',
  Alcohol_Consumption: 'No Alcohol Use',
  Physical_Activity_Level: 'Moderate',
  Diet_Quality: 'Good',
  Sleep_Quality: 'Good',
  Stress_Level: 'Moderate',
  Social_Engagement: 'Moderate'
};

const readableFieldName = field =>
  field.replaceAll('_', ' ');

const createField = (field, allowedValues) => {
  const wrapper = document.createElement('label');
  wrapper.className = 'prediction-field';
  wrapper.textContent = readableFieldName(field);

  let input;
  if (allowedValues) {
    input = document.createElement('select');
    allowedValues.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      input.append(option);
    });
  } else {
    input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
  }

  input.name = field;
  input.value = demoValues[field] ?? (allowedValues ? allowedValues[0] : 0);
  input.required = true;
  wrapper.append(input);
  return wrapper;
};

const loadPredictionForm = async () => {
  if (!predictionForm) return;

  try {
    const response = await fetch(`${API_URL}/schema`);
    if (!response.ok) throw new Error('The API returned an error.');
    const schema = await response.json();
    const categorical = schema.categorical_allowed_values;

    schema.numeric_features
      .concat(schema.categorical_features)
      .forEach(field => {
        predictionFields.append(
          createField(field, categorical[field])
        );
      });

    predictButton.disabled = false;
    modelStatus.textContent = 'Model fields loaded. Demonstration values are pre-filled.';
  } catch (error) {
    modelStatus.textContent = 'The local API is not running. Start it with: python predict_api.py';
  }
};

if (predictionForm) {
  loadPredictionForm();

  predictionForm.addEventListener('submit', async event => {
    event.preventDefault();
    predictButton.disabled = true;
    predictButton.textContent = 'Predicting...';
    predictionResult.hidden = false;
    predictionResult.textContent = 'Sending inputs to the local model...';

    const payload = {};
    new FormData(predictionForm).forEach((value, field) => {
      const input = predictionForm.elements[field];
      payload[field] = input.tagName === 'INPUT' ? Number(value) : value;
    });

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Prediction failed.');

      const probabilities = Object.entries(result.probabilities)
        .sort(([, first], [, second]) => second - first)
        .map(([label, probability]) =>
          `${label}: ${(probability * 100).toFixed(1)}%`
        ).join(' · ');
      predictionResult.innerHTML = `<strong>Prediction: ${result.diagnosis}</strong><br>${probabilities}`;
    } catch (error) {
      predictionResult.textContent = error.message;
    } finally {
      predictButton.disabled = false;
      predictButton.textContent = 'Run prediction';
    }
  });
}