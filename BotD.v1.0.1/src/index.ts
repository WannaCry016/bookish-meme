import BotDetector from './detector'; // Adjust the import path if necessary
import { State } from './types'; // Adjust based on your structure
import { getEnvironmentParametersAsJson } from './utils/api_para';
import { extractAdditionalInfo } from './utils/access_log'; // Import the extractAdditionalInfo function

// Main function to run the detection
async function runDetection() {
    const detector = new BotDetector();

    try {
        // Collect the components
        const components = await detector.collect();

        // Get the environment parameters as JSON
        const environmentParametersJson = await getEnvironmentParametersAsJson();
        const environmentParameters = JSON.parse(environmentParametersJson); // Parse the JSON string back to an object

        // Extract additional info (IP, geolocation, etc.)
        const additionalInfo = await extractAdditionalInfo();

        // Detect based on components and detectors
        const finalResult = detector.detect();
        const detections = detector.getDetections(); // Get individual detections

        // Combine everything into one JSON object
        const result = {
            finalResult,
            parameters: {
                ...additionalInfo,
                ...components,
                ...environmentParameters,
                ...detections,
            },
        };

        const response = await fetch('/api/saveData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(result),
        });

        if (response.ok) {
            console.log('Data sent successfully!');
        } else {
            console.error('Failed to send data.');
        }

    } catch (error) {
        console.error('Detection failed:', error);
    }
}

// Run the detection when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    runDetection();
});
