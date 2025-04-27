import json

import requests
from dotenv import load_dotenv
from elevenlabs import ElevenLabs, save
from s3 import S3
from rds import RedisHandler
from models.post import Post
import os



if __name__ == "__main__":

    load_dotenv(dotenv_path=".env")
    elevenlabs = os.getenv("ELEVENLABS_API_KEY")
    print(elevenlabs)

    elevenlabs_client = ElevenLabs(api_key=elevenlabs)
    s3_client = S3()
    redis_handler = RedisHandler()

    # Load filtered posts
    with open("filtered_further_posts.json", "r") as file:
        filtered_posts = json.load(file)

    # Process each post
    for post_data in filtered_posts:
        post = Post(**post_data)

        # Generate MP3 from content
        try:
            generated_audio = elevenlabs_client.generate(
                text=post.content,
                voice="Adam",
                model="eleven_flash_v2_5"
            )
        except Exception as e:
            print(f"Error generating audio for post {post.date}: {e}")
            continue

        save(generated_audio, "output.mp3")
        with open("output.mp3", "rb") as f:
            file_content = f.read()

        #Upload MP3 to S3
        try:
            s3_key = s3_client.upload_file(file_content, post)
        except Exception as e:
            print(f"Error uploading audio for post {post.date}: {e}")
            continue

        # Update post.tts with S3 key
        post.tts = s3_key

        # Save updated post in Redis
        try:
            redis_handler.save_post(post)
            #redis_handler.set(f"trump_post:{post.date}", post.dict(), expiry=30 * 24 * 60 * 60)
        except Exception as e:
            print(f"Error saving post {post.date} to Redis: {e}")

        print("Processed: ", post.date)