from setuptools import setup, find_packages

setup(
    name="idx-cli",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "rich>=13.0.0",
        "httpx>=0.25.0",
        "typer[all]>=0.9.0",
    ],
    entry_points={
        "console_scripts": [
            "idx=idx_cli.main:app",
        ],
    },
)
