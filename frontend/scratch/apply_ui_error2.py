import sys

with open("src/pages/common/Support.jsx", "r") as f:
    content = f.read()

target1 = """          const { error: uploadError } = await supabase.storage
            .from('support-attachments')
            .upload(filePath, file);
            
          if (uploadError) {
            console.error('Upload Error:', uploadError);
            throw new Error(`Failed to upload ${file.name}. Please try again.`);
          }"""

replacement1 = """          const { error: uploadError } = await supabase.storage
            .from('support-attachments')
            .upload(filePath, file);
            
          if (uploadError) {
            console.error('Upload Error Details:', uploadError);
            throw new Error(`Storage Error (${uploadError.code}): ${uploadError.message}. Ensure bucket 'support-attachments' exists and RLS allows inserts.`);
          }"""

target2 = """      } catch (err) {
        console.error('Support Error:', err);
        setError('Unable to send your support request. Please try again.');
      }"""

replacement2 = """      } catch (err) {
        console.error('Support Error:', err);
        setError(err.message || 'Unable to send your support request. Please try again.');
      }"""

if target1 in content and target2 in content:
    content = content.replace(target1, replacement1)
    content = content.replace(target2, replacement2)
    with open("src/pages/common/Support.jsx", "w") as f:
        f.write(content)
    print("Frontend error handling updated successfully!")
else:
    print("Target not found.")
