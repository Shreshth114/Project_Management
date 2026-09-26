import sys

with open("src/pages/common/Support.jsx", "r") as f:
    content = f.read()

target1 = """      if (functionError) {
        console.error('Edge Function Error:', functionError);
        throw new Error(`Edge Function Error: ${functionError.message || JSON.stringify(functionError)}`);
      }"""

replacement1 = """      if (functionError) {
        let actualErrorMsg = functionError.message || 'Unknown Edge Function Error';
        if (functionError.context && typeof functionError.context.json === 'function') {
          try {
            const errBody = await functionError.context.json();
            console.error('Edge Function Body:', errBody);
            actualErrorMsg = errBody.error || JSON.stringify(errBody);
            if (errBody.details) {
               actualErrorMsg += ' - ' + JSON.stringify(errBody.details);
            }
          } catch (e) {
            console.error('Failed to parse Edge Function error body', e);
          }
        }
        throw new Error(`Edge Function Error: ${actualErrorMsg}`);
      }"""

if target1 in content:
    content = content.replace(target1, replacement1)
    with open("src/pages/common/Support.jsx", "w") as f:
        f.write(content)
    print("Frontend error handling updated successfully!")
else:
    print("Target not found.")
