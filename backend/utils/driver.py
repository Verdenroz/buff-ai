from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


def init_driver(
        headless: bool = True,
        window_size: tuple = (1920, 1080),
        download_dir: str | None = None,
        user_agent: str | None = None,
        load_timeout: int | None = None
) -> webdriver.Chrome:
    """
    Initialize a Chrome WebDriver with advanced configuration options.

    Args:
        headless: Whether to run Chrome in headless mode
        window_size: Browser window dimensions (width, height)
        download_dir: Optional directory for downloads
        user_agent: Optional custom user agent string
        load_timeout: Optional page load timeout in seconds

    Returns:
        Configured Chrome WebDriver instance
    """
    chrome_opts = Options()

    # Headless mode
    if headless:
        chrome_opts.add_argument("--headless=new")

    # Window and performance settings
    chrome_opts.add_argument(f"--window-size={window_size[0]},{window_size[1]}")
    chrome_opts.add_argument("--disable-gpu")
    chrome_opts.add_argument("--disable-extensions")
    chrome_opts.add_argument("--no-sandbox")
    chrome_opts.add_argument("--disable-dev-shm-usage")

    # User agent
    if user_agent:
        chrome_opts.add_argument(f"user-agent={user_agent}")
    else:
        chrome_opts.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )

    # Download settings
    if download_dir:
        chrome_opts.add_experimental_option(
            "prefs", {
                "download.default_directory": download_dir,
                "download.prompt_for_download": False,
                "download.directory_upgrade": True,
                "safebrowsing.enabled": False
            }
        )

    # Initialize driver
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_opts
    )

    # Set page load timeout if specified
    if load_timeout:
        driver.set_page_load_timeout(load_timeout)

    return driver
