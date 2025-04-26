from typing import Annotated

from fastapi import Depends
from starlette.requests import Request

from rds import RedisHandler
from s3 import S3


async def get_s3(request: Request) -> S3:
    """Get S3 service from app state"""
    return request.app.state.s3


async def get_rds(request: Request):
    """Get RDS service from app state"""
    return request.app.state.rds


S3 = Annotated[S3, Depends(get_s3)]
RDS = Annotated[RedisHandler, Depends(get_rds)]
