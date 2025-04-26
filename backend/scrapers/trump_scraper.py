import json
import os
import time
from datetime import datetime, timedelta
from typing import List

from selenium.common import NoSuchElementException, StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from models.post import Post
from utils.driver import init_driver


def scrape_latest_trump_posts() -> List[Post]:
    """
    Scrape Donald Trump's Truth Social posts until reaching posts one month old
    Returns posts in normalized Post format
    """
    trump_handle = "@realDonaldTrump"

    driver = init_driver(
        headless=True,
        window_size=(1200, 2000),
        load_timeout=30
    )

    # Navigate to Trump's Truth Social page
    driver.get(f"https://truthsocial.com/{trump_handle}")
    time.sleep(3)  # Give page time to fully load

    # Calculate cutoff date (one month ago)
    cutoff_date = datetime.now() - timedelta(days=30)

    collected = {}
    empty_scrolls = 0
    max_empty_scrolls = 10  # Increased from 5
    last_scroll = driver.execute_script("return window.pageYOffset;")
    reached_cutoff = False

    while not reached_cutoff and empty_scrolls < max_empty_scrolls:
        try:
            # Use wait to ensure elements are loaded
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-index]"))
            )

            elems = driver.find_elements(By.CSS_SELECTOR, "div[data-index]")
            processed_any = False

            for el in elems:
                try:
                    # Get data-index before anything else to help with debugging
                    idx = el.get_attribute("data-index")
                    if not idx or idx in collected:
                        continue

                    # Find post wrapper with added wait
                    try:
                        wrapper = el.find_element(By.CSS_SELECTOR, "div.status__wrapper[data-id]")
                        post_id = wrapper.get_attribute("data-id")
                    except (NoSuchElementException, StaleElementReferenceException):
                        continue

                    # Verify this is Trump's post by checking the handle
                    try:
                        post_handle = wrapper.find_element(By.CSS_SELECTOR, "p.font-normal").text
                        if post_handle.strip() != trump_handle:
                            continue
                    except (NoSuchElementException, StaleElementReferenceException):
                        continue

                    # Extract text content
                    try:
                        text = wrapper.find_element(By.CSS_SELECTOR, "p[lang]").text
                        if not text:
                            continue
                    except (NoSuchElementException, StaleElementReferenceException):
                        continue

                    # Extract timestamp
                    try:
                        time_elem = wrapper.find_element(By.TAG_NAME, "time")
                        timestamp_str = time_elem.get_attribute("title")
                        parsed_ts = datetime.strptime(timestamp_str, "%b %d, %Y, %I:%M %p") if timestamp_str else None
                        if not parsed_ts:
                            continue
                    except Exception:
                        continue

                    # Stop if we've reached posts older than cutoff date
                    if parsed_ts < cutoff_date:
                        print(f"Reached cutoff date with post from {parsed_ts} with cutoff {cutoff_date}")
                        reached_cutoff = True
                        break

                    # Convert to Unix timestamp for storage
                    unix_ts = int(parsed_ts.timestamp())

                    # Create Post object
                    post = Post(
                        author="Donald J. Trump",
                        content=text,
                        date=unix_ts,
                        tts=""
                    )

                    collected[idx] = post
                    processed_any = True
                    print(f"Scraped post {idx}: {post_id}, {parsed_ts}")

                except StaleElementReferenceException:
                    # Just skip this element if it became stale
                    continue
                except Exception as e:
                    # Log and continue with next element
                    print(f"Error processing post: {str(e)[:100]}...")
                    continue

            # Scroll logic with improved reliability
            driver.execute_script("window.scrollBy(0, 800);")
            time.sleep(2)  # Slightly longer pause for page to load
            new_scroll = driver.execute_script("return window.pageYOffset;")

            if new_scroll == last_scroll:
                empty_scrolls += 1
                if empty_scrolls >= 3:  # If multiple empty scrolls, try scrolling further
                    driver.execute_script("window.scrollBy(0, 1200);")
                    time.sleep(2.5)
                    new_scroll = driver.execute_script("return window.pageYOffset;")
            else:
                empty_scrolls = 0
                last_scroll = new_scroll

            # If we processed posts this round, reset empty_scrolls counter
            if processed_any:
                empty_scrolls = 0

        except Exception as e:
            print(f"Error during scroll loop: {e}")
            empty_scrolls += 1
            time.sleep(2)

    driver.quit()

    # Convert to list and save to JSON
    posts = list(collected.values())

    # Save to JSON file
    if posts:
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)
        with open(f"{output_dir}/trump_posts.json", "w", encoding="utf-8") as f:
            json.dump([p.model_dump() for p in posts], f, indent=2)
        print(f"Saved {len(posts)} posts to trump_posts.json")

    return posts


if __name__ == "__main__":
    posts = scrape_latest_trump_posts()
    print(f"Scraped {len(posts)} Trump posts")