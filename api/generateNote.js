export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { submission } = req.body

  const prompt = `
Generate a concise pharmacist-style summary for a contraceptive consultation:
- Patient: ${submission.firstName} ${submission.lastName}, DOB: ${submission.dob}
- Pill Choice: ${submission.pillChoice}
- Medical History: ${Array.isArray(submission.selectApplicable) ? submission.selectApplicable.join(', ') : 'None'}
- Extra Meds: ${submission.extraMeds || 'None'}
- BP: ${submission.bpSystolic}/${submission.bpDiastolic}
- Height: ${submission.heightFt || submission.heightCm}, Weight: ${submission.weightSt || submission.weightKg}
- Notes should summarize suitability for contraception and highlight any flags.

Respond with only the summary text.`

  const llamaResponse = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({ inputs: prompt })
  })

  const data = await llamaResponse.json()

  if (data.error) {
    return res.status(500).json({ error: data.error })
  }

  return res.status(200).json({ note: data.generated_text || data[0]?.generated_text })
}
