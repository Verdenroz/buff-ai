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

    # s3 = S3()
    # with open("videoplayback.mp3", "rb") as f:
    #     file_content = f.read()
    # post = Post(author="John Doe", date=2, content="Sample content")
    # key = s3.upload_file(file_content, post)
    # url = s3.get_presigned_url(key)
    # print(f"Presigned URL: {url}")


    #Save eleven labs mp3 to file locally
    generated_audio = elevenlabs_client.generate(
        text="This is a longer sample text that should generate properly.",
        voice="Adam",
        model="eleven_multilingual_v2"
    )
    save(generated_audio, "output.mp3")

    # Load filtered posts
    with open("filtered_posts.json", "r") as file:
        filtered_posts = json.load(file)

    # Process each post
    for post_data in filtered_posts:
        post = Post(**post_data)

        # Generate MP3 from content
        try:
            generated_audio = elevenlabs_client.generate(
                text=post.content,
                voice="Adam",
                model="eleven_multilingual_v2"
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
            url = s3_client.get_presigned_url(s3_key)
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