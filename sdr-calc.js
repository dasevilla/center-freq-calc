const EXTRA_COVERAGE_PERCENT = 0.0;

const DEFAULT_SAMPLE_RATE = 2.4; // in MHz

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("frequencyForm").onsubmit = function(event) {
        event.preventDefault(); // Prevent form from submitting normally

        // Get the input values
        let frequenciesMHz = document.getElementById("frequencies").value
            .split(/\s+/)
            .map(f => parseFloat(f.trim().replace(/[^0-9.]+$/, '')));
        let sampleRateMHz = parseFloat(document.getElementById("sampleRate").value);

        // Perform the calculations
        let radioSetup = calculateRadioSetup(frequenciesMHz, sampleRateMHz);

        // Display the results
        displayResults(radioSetup);
    };

    // Get the query parameters
    const urlParams = new URLSearchParams(window.location.search);

    // Pre-fill the frequencies to monitor with the optional query parameter 'freqs'
    const inputFrequenciesMHz = urlParams.get('freqs');
    if (inputFrequenciesMHz) {
        document.getElementById("frequencies").value = inputFrequenciesMHz;
    }

    // Pre-fill the sample rate with the optional query parameter 'rate'
    const inputSampleRateMHz = urlParams.get('rate');
    if (inputSampleRateMHz) {
        document.getElementById("sampleRate").value = inputSampleRateMHz;
    }
});

function displayResults(radioSetup) {
    let resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ""; // Clear previous results

    radioSetup.forEach(radio => {
      // List of frequencies covered by this radio, including the center frequency
      let allFrequencies = radio.frequencies.slice();
      allFrequencies.push(radio.centerFrequency);

      let radioInfo = `
        <h3>Radio ${radio.radioNumber}</h3>
        <p>Center frequency (MHz): ${radio.centerFrequency.toFixed(4)}
        <br>Frequency range (MHz): ${radio.frequencyRange.map(freq => freq.toFixed(4)).join(" to ")}
        <br>Recorders needed: ${radio.recordersNeeded}</p>
        <p>Frequencies (MHz):</p>
        <ul>
          ${allFrequencies.sort().map(freq => `<li><span class="font-monospace">${freq.toFixed(4)}</span>${freq === radio.centerFrequency ? " <strong>Center frequency</strong>" : ""}</li>`).join("")}
        </ul>
      `;
      resultsDiv.innerHTML += radioInfo;
    });
}

function calculateRadioSetup(frequenciesMHz, sampleRateMHz) {
  let radios = [];
  let frequencies = frequenciesMHz.slice().sort((a, b) => a - b);

  while (frequencies.length > 0) {
      // Start with the lowest frequency and calculate the upper limit for this radio
      const startFreq = frequencies[0];
      const endFreq = startFreq + sampleRateMHz;

      // Find frequencies that can be covered by this radio
      const coveredFrequencies = frequencies.filter(f => f <= endFreq);

      // Calculate center frequency
      const centerFreq = (startFreq + endFreq) / 2;

      // Append radio information
      radios.push({
          radioNumber: radios.length + 1,
          frequencies: coveredFrequencies,
          centerFrequency: centerFreq,
          frequencyRange: [startFreq, endFreq],
          recordersNeeded: coveredFrequencies.length
      });

      // Update the list of frequencies, removing those covered by this radio
      frequencies = frequencies.filter(f => f > endFreq);
  }

  return radios;
}
