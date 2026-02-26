import numpy as np
import requests
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from django.db import transaction
from .models import Doubt, DoubtCluster


def generate_cluster_summary(doubts_text_list):
    prompt = f"""
        You are a topic extraction assistant.

        Your task:
        Identify the common topic of the student doubts.

        STRICT RULES:
        - Output must start EXACTLY with:
        Students are having doubt in:
        - Output must be ONE short phrase only.
        - DO NOT explain.
        - DO NOT answer.
        - DO NOT write multiple sentences.
        - DO NOT write code.
        - DO NOT include quotes.
        - Keep it under 12 words.

        Student Doubts:
        ----------------
        {chr(10).join(doubts_text_list)}
        ----------------

        Output:
        Students are having doubt in:
    """

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "phi",
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,
                "num_predict": 40
            }
        }
    )

    result = response.json()["response"].strip()

    # Safety cleanup: ensure prefix exists
    if not result.startswith("Students are having doubt in:"):
        result = "Students are having doubt in: " + result

    return result

model=SentenceTransformer("all-MiniLM-L6-v2")
THRESHOLD=0.75

@transaction.atomic
def process_doubt(student,text,module_file,slide_number):
    embedding=model.encode(text)

    clusters=DoubtCluster.objects.filter(
        module=module_file.module,
        slide_number=slide_number,
    )
    best_cluster=None
    best_similarity=0

    for cluster in clusters:
        centeroid=np.array(cluster.centeroid_embedding)
        similarity=cosine_similarity([embedding],[centeroid])[0][0]

        if similarity>best_similarity:
            best_similarity=similarity
            best_cluster=cluster

    if best_similarity>=THRESHOLD:
        doubt=Doubt.objects.create(
            student=student,
            text=text, 
            embedding=embedding,
            module=module_file.module,
            module_file=module_file,
            slide_number=slide_number,
            cluster=best_cluster,
        )
        cluster_embedding=np.array(
            [d.embedding for d in best_cluster.doubts.all()]
        )

        new_centroid=np.mean(cluster_embedding,axis=0)
        best_cluster.centeroid_embedding=new_centroid
        best_cluster.save()
        return best_cluster

    else:
        new_cluster=DoubtCluster.objects.create(
            module=module_file.module,
            slide_number=slide_number,
            centeroid_embedding=embedding,
        )

        Doubt.objects.create(
            student=student,
            text=text,
            embedding=embedding,
            module=module_file.module,
            module_file=module_file,
            slide_number=slide_number,
            cluster=new_cluster,
        )

        return new_cluster

def generate_ai_teacher_response(doubts_text_list):
    prompt = f"""
        You are a helpful academic teacher.

        Below are multiple student doubts related to the same topic.

        Your task:
        Provide a clear, structured, concise explanation addressing their confusion.

        Rules:
        - Do not mention that this is AI generated.
        - Keep explanation simple and classroom friendly.
        - Maximum 200 words.

        Student Doubts:
        ----------------
        {chr(10).join(doubts_text_list)}
        ----------------

        Teacher Explanation:
    """

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "phi",
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "num_predict": 200
            }
        }
    )

    return response.json()["response"].strip()
