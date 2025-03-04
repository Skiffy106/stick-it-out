interface ResultType {
    vertexShaderText: string | null,
    fragmentShaderText: string | null,
}

/**
 * Fetch the fragment and vertex shader text from external files.
 * @param vertexShaderPath
 * @param fragmentShaderPath
 * @returns {Promise<{vertexShaderText: string | null, fragmentShaderText: string | null}>}
 */
export async function fetchShaderTexts(vertexShaderPath: string, fragmentShaderPath: string) {
    const results: ResultType = {
        vertexShaderText: null,
        fragmentShaderText: null,
    };

    let errors: string[] = [];
    await Promise.all([
        fetch(vertexShaderPath)
            .catch((e) => {
                errors.push(e);
            })
            .then(async (response) => {
                if (response == undefined) {
                    errors.push(
                        `No response for ${vertexShaderPath}.`
                    );
                } else if (response.status === 200) {
                    results.vertexShaderText = await response.text();
                } else {
                    errors.push(
                        `Non-200 response for ${vertexShaderPath}.  ${response.status}:  ${response.statusText}`
                    );
                }
            }),
            fetch(fragmentShaderPath)
            .catch((e) => {
                errors.push(e);
            })
            .then(async (response) => {
                if (response == undefined) {
                    errors.push(
                        `No response for ${fragmentShaderPath}.`
                    );
                } else if (response.status === 200) {
                    results.vertexShaderText = await response.text();
                } else {
                    errors.push(
                        `Non-200 response for ${fragmentShaderPath}.  ${response.status}:  ${response.statusText}`
                    );
                }
            }),
            
    ]);

    if (errors.length !== 0) {
        throw new Error(
            `Failed to fetch shader(s):\n${JSON.stringify(errors, (key, value) => {
                if (value?.constructor.name === 'Error') {
                    return {
                        name: value.name,
                        message: value.message,
                        stack: value.stack,
                        cause: value.cause,
                    };
                }
                return value;
            }, 2)}`
        );
    }
    return results;
}