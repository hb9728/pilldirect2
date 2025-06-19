export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { submission } = req.body

  const prompt = `
Summarise this contraceptive consultation into 2-4 clinical sentences for a pharmacist:

Patient: ${submission.firstName} ${submission.lastName}, DOB: ${submission.dob}
Pill Choice: ${submission.pillChoice}
Medical History: ${Array.isArray(submission.selectApplicable) ? submission.selectApplicable.join(', ') : 'None'}
Extra Meds: ${submission.extraMeds || 'None'}
BP: ${submission.bpSystolic}/${submission.bpDiastolic}
Height: ${submission.heightFt || submission.heightCm}, Weight: ${submission.weightSt || submission.weightKg}
`

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-large", {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          return_full_text: false
        }
      })
    })

    const raw = await response.text()
    let data
    try {
      data = JSON.parse(raw)
    } catch (err) {
      console.error('❌ HF returned invalid JSON:', raw)
      return res.status(500).json({ error: 'Hugging Face response was not JSON' })
    }

    if (data.error) {
      console.error('❌ HF API Error:', data.error)
      return res.status(500).json({ error: data.error })
    }

    const generatedText = data[0]?.generated_text || '—'
    return res.status(200).json({ note: generatedText })

  } catch (err) {
    console.error('❌ Unexpected failure:', err)
    return res.status(500).json({ error: 'Unexpected error' })
  }
}
