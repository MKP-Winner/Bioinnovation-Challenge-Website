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

const intakeProgressText =
  document.getElementById('intakeProgressText');

const intakeProgressBar =
  document.getElementById('intakeProgressBar');

const loadDemoButton =
  document.getElementById('loadDemoButton');

const resetPredictionButton =
  document.getElementById('resetPredictionButton');

const API_URL =
  location.origin === 'null'
    ? 'http://127.0.0.1:5000'
    : location.origin;

const demoValues = {
  Age: 67,
  Sex: 'Female',
  Sleep_Duration: 6,
  Exercise_Frequency_Weekly: 3,
  Family_History_Alzheimer: 0,
  Family_History_Dementia: 0,
  Head_Injury: 0,
  Medication_Count: 2,
  APOE_e4: 0,
  Height_in: 65,
  Weight_lb: 155
};

const inputConfig = {
  Age: {min: 18, max: 120, step: 1, placeholder: 'e.g. 67'},
  Sleep_Duration: {min: 0, max: 24, step: 0.5, placeholder: 'Hours'},
  Exercise_Frequency_Weekly: {min: 0, max: 7, step: 1, placeholder: 'Days'},
  Medication_Count: {min: 0, max: 100, step: 1, placeholder: 'Count'}
};

// Yes/No questions that map to 0/1 under the hood
const binaryFields = new Set([
  'Family_History_Alzheimer',
  'Family_History_Dementia',
  'Head_Injury'
]);

// Fields the model expects that are NOT asked directly -- they're
// derived from friendlier sub-questions at submit time instead.
const derivedFields = new Set(['BMI', 'APOE_e4']);

let schemaDescriptions = {};
let numericFields = new Set();

const readableFieldName = field =>
  field.replaceAll('_', ' ');

const updateIntakeProgress = () => {
  if (!predictionForm || !intakeProgressText || !intakeProgressBar) return;
  const requiredFields = [...predictionForm.querySelectorAll('[required]')];
  const completed = requiredFields.filter(field => field.value !== '' && field.validity.valid).length;
  const total = requiredFields.length;
  intakeProgressText.textContent = `${completed} of ${total} answers complete`;
  intakeProgressBar.style.width = `${total ? completed / total * 100 : 0}%`;
};

const clearPredictionResult = () => {
  if (!predictionResult) return;
  predictionResult.hidden = true;
  predictionResult.classList.remove('has-result', 'has-error');
  predictionResult.textContent = '';
};

const applyDemoProfile = () => {
  if (!predictionForm) return;
  Object.entries(demoValues).forEach(([field, value]) => {
    const input = predictionForm.elements[field];
    if (input) input.value = value;
  });
  clearPredictionResult();
  updateIntakeProgress();
  predictionForm.querySelector('[name="Age"]')?.focus();
};

const createField = (field, allowedValues) => {
  const wrapper = document.createElement('label');
  wrapper.className = 'prediction-field';
  wrapper.textContent = schemaDescriptions[field] || readableFieldName(field);

  // BMI is asked as height + weight instead of a raw BMI number --
  // most people know their height/weight, not their BMI off-hand.
  if (field === 'BMI') {
    wrapper.textContent = 'What is your approximate height and weight?';
    const row = document.createElement('div');
    row.className = 'prediction-subfields';

    const heightInput = document.createElement('input');
    heightInput.type = 'number';
    heightInput.step = 'any';
    heightInput.name = 'Height_in';
    heightInput.placeholder = 'Height (inches)';
    heightInput.min = '36';
    heightInput.max = '96';
    heightInput.inputMode = 'decimal';
    heightInput.required = true;

    const weightInput = document.createElement('input');
    weightInput.type = 'number';
    weightInput.step = 'any';
    weightInput.name = 'Weight_lb';
    weightInput.placeholder = 'Weight (lb)';
    weightInput.min = '50';
    weightInput.max = '700';
    weightInput.inputMode = 'decimal';
    weightInput.required = true;

    row.append(heightInput, weightInput);
    wrapper.append(row);
    return wrapper;
  }

  // APOE-e4 genetic status is usually unknown unless someone has had
  // genetic testing -- offer an honest "Not sure" option that the
  // model treats as a missing value rather than forcing a guess.
  if (field === 'APOE_e4') {
    const input = document.createElement('select');
    [['', 'Not sure / never tested'], ['0', 'No'], ['1', 'Yes']].forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      input.append(option);
    });
    input.name = field;
    input.value = '';
    wrapper.append(input);
    return wrapper;
  }

  let input;
  if (binaryFields.has(field)) {
    input = document.createElement('select');
    const placeholder = new Option('Select an answer', '');
    placeholder.disabled = true;
    placeholder.selected = true;
    input.append(placeholder);
    [['0', 'No'], ['1', 'Yes']].forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      input.append(option);
    });
  } else if (allowedValues) {
    input = document.createElement('select');
    const placeholder = new Option('Select an option', '');
    placeholder.disabled = true;
    placeholder.selected = true;
    input.append(placeholder);
    allowedValues.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      input.append(option);
    });
  } else {
    input = document.createElement('input');
    input.type = 'number';
    const config = inputConfig[field] || {step: 'any', placeholder: 'Enter a value'};
    input.step = config.step;
    input.placeholder = config.placeholder;
    if (config.min !== undefined) input.min = config.min;
    if (config.max !== undefined) input.max = config.max;
    input.inputMode = 'decimal';
  }

  input.name = field;
  input.required = field !== 'APOE_e4';
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
    schemaDescriptions = schema.feature_descriptions || {};
    numericFields = new Set(schema.numeric_features);

    (schema.intake_features || schema.numeric_features.concat(schema.categorical_features))
      .forEach(field => {
        predictionFields.append(
          createField(field, categorical[field])
        );
      });

    predictButton.disabled = false;
    loadDemoButton.disabled = false;
    resetPredictionButton.disabled = false;
    modelStatus.textContent = 'Model ready. Answer the questions below or load a fictional demo profile.';
    updateIntakeProgress();
  } catch (error) {
    modelStatus.textContent = 'The calculator is unavailable. Start the API, then open http://127.0.0.1:5000/ in your browser.';
  }
};

if (predictionForm) {
  loadPredictionForm();

  predictionForm.addEventListener('input', () => {
    clearPredictionResult();
    updateIntakeProgress();
  });

  predictionForm.addEventListener('change', () => {
    clearPredictionResult();
    updateIntakeProgress();
  });

  predictionForm.addEventListener('reset', () => {
    setTimeout(() => {
      clearPredictionResult();
      updateIntakeProgress();
    });
  });

  loadDemoButton?.addEventListener('click', applyDemoProfile);

  predictionForm.addEventListener('submit', async event => {
    event.preventDefault();
    predictButton.disabled = true;
    predictButton.textContent = 'Predicting...';
    predictionResult.hidden = false;
    predictionResult.textContent = 'Sending inputs to the local model...';

    const payload = {};
    new FormData(predictionForm).forEach((value, field) => {
      // Height_in / Weight_lb are collected only to derive BMI --
      // they aren't sent to the model directly.
      if (field === 'Height_in' || field === 'Weight_lb') return;

      if (field === 'APOE_e4') {
        payload[field] = value === '' ? null : Number(value);
        return;
      }

      payload[field] = numericFields.has(field) ? Number(value) : value;
    });

    const heightIn = Number(predictionForm.elements['Height_in']?.value);
    const weightLb = Number(predictionForm.elements['Weight_lb']?.value);
    if (heightIn && weightLb) {
      payload.BMI = Number((703 * weightLb / (heightIn * heightIn)).toFixed(1));
    }

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Prediction failed.');

      const signal = result.alzheimer_probability < .2
        ? 'Lower similarity to AD-labeled research records'
        : result.alzheimer_probability < .5
          ? 'Mixed similarity to AD-labeled research records'
          : 'Higher similarity to AD-labeled research records';
      const probability = (result.alzheimer_probability * 100).toFixed(1);
      predictionResult.classList.remove('has-error');
      predictionResult.classList.add('has-result');
      predictionResult.innerHTML = `<strong>Research estimate: ${probability}% Alzheimer’s pattern</strong><br><span>This result is not a diagnosis or a prediction of an individual’s future.</span>`;
      const title = document.createElement('strong');
      title.textContent = `Synthetic-data prediction: ${probability}% AD-pattern match`;
      const explanation = document.createElement('span');
      explanation.textContent = ` ${signal}. This percentage is generated from synthetic research data and is not a diagnosis, clinical risk score, or prediction of an individual’s future.`;
      predictionResult.replaceChildren(title, explanation);
    } catch (error) {
      predictionResult.classList.remove('has-result');
      predictionResult.classList.add('has-error');
      predictionResult.textContent = error.message;
    } finally {
      predictButton.disabled = false;
      predictButton.textContent = 'Run prediction';
    }
  });
}
